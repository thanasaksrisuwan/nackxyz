<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Aws\DynamoDb\DynamoDbClient;
use Aws\Exception\AwsException;

class TradeBot extends Command
{
    protected $signature = 'trade:run';
    protected $description = 'Execute the Binance TH RSI trading bot logic securely';

    private function getBaseUrl(): string {
        return env('BINANCE_BASE_URL', 'https://api.binance.th');
    }
    
    private $targetBudgetUsdt = 15.0; // Min notional on Binance is usually $10. Use $15 to be safe.

    public function handle()
    {
        Log::info('TradeBot: Starting RSI trading cycle...');

        try {
            $baseAsset = 'WLD';
            $quoteAsset = 'USDT';
            $symbol = $baseAsset . $quoteAsset;
            $interval = '15m'; 

            // 1. Fetch historical closing prices
            $closes = $this->fetchBinanceClosingPrices($symbol, $interval, 100);
            if (count($closes) < 15) {
                Log::warning('TradeBot: Not enough data to calculate RSI.');
                return;
            }

            $currentPrice = end($closes);
            
            // 2. Calculate RSI
            $rsi = $this->calculateRSI($closes, 14);
            $rsiFormatted = number_format($rsi, 2);
            Log::info("TradeBot: Current {$symbol} price is {$currentPrice} {$quoteAsset} | RSI: {$rsiFormatted}");

            // 3. Position State Management (Issue A)
            $balances = $this->fetchAccountBalances();
            $baseBalance = $balances[$baseAsset] ?? 0.0;
            
            // If the value of our WLD is > 5 USDT, we consider ourselves "IN" a position
            $isHoldingPosition = ($baseBalance * $currentPrice) > 5.0;
            Log::info("TradeBot: Holding {$baseBalance} {$baseAsset}. State: " . ($isHoldingPosition ? 'IN POSITION' : 'FLAT'));

            // 4. Trading Logic Evaluation (RSI Strategy + State Constraints)
            $action = 'HOLD';
            
            if ($rsi < 30 && !$isHoldingPosition) {
                // Oversold & Flat -> Buy
                $action = 'BUY';
            } elseif ($rsi > 70 && $isHoldingPosition) {
                // Overbought & Holding -> Sell
                $action = 'SELL';
            }

            Log::info("TradeBot: Decision made -> {$action}");

            // 5. Execute Trade (Issue B: Dynamic Quantity, Issue D: recvWindow)
            if ($action !== 'HOLD') {
                
                // Calculate dynamic quantity. WLD step size allows 1 decimal place usually.
                if ($action === 'BUY') {
                    // Buy $15 worth of WLD
                    $quantity = floor(($this->targetBudgetUsdt / $currentPrice) * 10) / 10;
                } else {
                    // Sell our entire WLD balance
                    $quantity = floor($baseBalance * 10) / 10;
                }

                if ($quantity <= 0) {
                    Log::error("TradeBot: Calculated quantity is 0. Cannot execute trade.");
                    return;
                }

                $tradeSuccess = $this->executeLiveTrade($symbol, $action, $quantity);
                
                // 6. Save to DynamoDB & Send Telegram Alert
                if ($tradeSuccess) {
                    $this->logTradeToDynamoDB($symbol, $action, $currentPrice, $quantity);
                    
                    $message = "🤖 <b>Binance Bot Alert</b>\n"
                             . "✅ Test Trade Executed\n"
                             . "<b>Action:</b> {$action}\n"
                             . "<b>Symbol:</b> {$symbol}\n"
                             . "<b>Price:</b> " . number_format($currentPrice, 4) . " {$quoteAsset}\n"
                             . "<b>Quantity:</b> {$quantity} {$baseAsset}\n"
                             . "<b>RSI (14):</b> {$rsiFormatted}";
                    $this->sendTelegramAlert($message);
                }
            }

        } catch (\Exception $e) {
            Log::error('TradeBot Error: ' . $e->getMessage());
        }

        Log::info('TradeBot: Cycle completed.');
    }

    private function fetchAccountBalances(): array
    {
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');
        
        if (!$apiKey || !$apiSecret) return [];

        $timestamp = (int) (microtime(true) * 1000);
        $queryString = "recvWindow=10000&timestamp={$timestamp}";
        $signature = hash_hmac('sha256', $queryString, $apiSecret);

        $response = Http::withHeaders([
            'X-MBX-APIKEY' => $apiKey
        ])->get("{$this->getBaseUrl()}/api/v1/accountV2", [
            'recvWindow' => 10000,
            'timestamp' => $timestamp,
            'signature' => $signature
        ]);

        $balances = [];
        if ($response->successful()) {
            foreach ($response->json('balances', []) as $asset) {
                $balances[$asset['asset']] = (float)$asset['free'];
            }
        }
        return $balances;
    }

    private function fetchBinanceClosingPrices(string $symbol, string $interval, int $limit): array
    {
        $response = Http::get("{$this->getBaseUrl()}/api/v1/klines", [
            'symbol' => $symbol,
            'interval' => $interval,
            'limit' => $limit
        ]);

        if ($response->successful()) {
            $klines = $response->json();
            $closes = [];
            foreach ($klines as $kline) {
                $closes[] = (float) $kline[4];
            }
            return $closes;
        }

        throw new \Exception("Failed to fetch klines");
    }

    private function calculateRSI(array $closes, int $period = 14): float
    {
        if (count($closes) < $period + 1) return 50.0;

        $gains = 0.0;
        $losses = 0.0;

        for ($i = 1; $i <= $period; $i++) {
            $change = $closes[$i] - $closes[$i - 1];
            if ($change > 0) $gains += $change;
            else $losses += abs($change);
        }

        $avgGain = $gains / $period;
        $avgLoss = $losses / $period;

        for ($i = $period + 1; $i < count($closes); $i++) {
            $change = $closes[$i] - $closes[$i - 1];
            $gain = $change > 0 ? $change : 0.0;
            $loss = $change < 0 ? abs($change) : 0.0;

            $avgGain = (($avgGain * ($period - 1)) + $gain) / $period;
            $avgLoss = (($avgLoss * ($period - 1)) + $loss) / $period;
        }

        if ($avgLoss == 0) return 100.0;

        $rs = $avgGain / $avgLoss;
        return 100.0 - (100.0 / (1.0 + $rs));
    }

    // Execute a live trade on Binance TH
    private function executeLiveTrade(string $symbol, string $side, float $quantity): bool
    {
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');

        if (!$apiKey || !$apiSecret) return false;

        $timestamp = (int) (microtime(true) * 1000);
        $params = [
            'symbol' => $symbol,
            'side' => $side,
            'type' => 'MARKET',
            'quantity' => $quantity,
            'recvWindow' => 10000,
            'timestamp' => $timestamp,
        ];

        $queryString = http_build_query($params);
        $signature = hash_hmac('sha256', $queryString, $apiSecret);
        $params['signature'] = $signature;

        $response = Http::withHeaders([
            'X-MBX-APIKEY' => $apiKey
        ])->post("{$this->getBaseUrl()}/api/v1/order", $params);

        if ($response->successful()) {
            return true;
        }

        Log::error("TradeBot: Trade execution failed: " . $response->body());
        return false;
    }

    private function logTradeToDynamoDB(string $symbol, string $action, float $price, float $quantity)
    {
        $tableName = env('DYNAMODB_TABLE');
        if (!$tableName) return;

        $client = new DynamoDbClient([
            'region'  => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
            'version' => 'latest'
        ]);

        try {
            $client->putItem([
                'TableName' => $tableName,
                'Item' => [
                    'id'        => ['S' => uniqid('trade_')],
                    'symbol'    => ['S' => $symbol],
                    'action'    => ['S' => $action],
                    'price'     => ['N' => (string) $price],
                    'quantity'  => ['N' => (string) $quantity],
                    'timestamp' => ['N' => (string) time()]
                ]
            ]);
        } catch (AwsException $e) {
            Log::error("TradeBot: DynamoDB Error - " . $e->getAwsErrorMessage());
        }
    }

    private function sendTelegramAlert(string $message)
    {
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) return;

        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML'
        ]);
    }
}
