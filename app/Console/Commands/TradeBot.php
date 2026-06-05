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
    protected $description = 'Execute the Binance TH RSI trading bot logic and log to DynamoDB';

    private $baseUrl = 'https://api.binance.th';

    public function handle()
    {
        Log::info('TradeBot: Starting RSI trading cycle...');

        try {
            $symbol = 'BTCTHB'; // Trading pair
            $interval = '15m';  // 15-minute timeframe for RSI

            // 1. Fetch historical closing prices (last 100 candles)
            $closes = $this->fetchBinanceClosingPrices($symbol, $interval, 100);
            
            if (count($closes) < 15) {
                Log::warning('TradeBot: Not enough data to calculate RSI.');
                return;
            }

            $currentPrice = end($closes);
            
            // 2. Calculate RSI
            $rsi = $this->calculateRSI($closes, 14);
            $rsiFormatted = number_format($rsi, 2);
            
            Log::info("TradeBot: Current {$symbol} price is {$currentPrice} THB | RSI: {$rsiFormatted}");

            // 3. Trading Logic Evaluation (RSI Strategy)
            $action = 'HOLD';
            
            if ($rsi < 30) {
                // Oversold -> Buy Low
                $action = 'BUY';
            } elseif ($rsi > 70) {
                // Overbought -> Sell High
                $action = 'SELL';
            }

            Log::info("TradeBot: Decision made -> {$action}");

            // 4. Execute Trade (Using TEST endpoint to protect funds)
            if ($action !== 'HOLD') {
                $tradeSuccess = $this->executeTestTrade($symbol, $action);
                
                // 5. Save to DynamoDB & Send Telegram Alert
                if ($tradeSuccess) {
                    $this->logTradeToDynamoDB($symbol, $action, $currentPrice);
                    
                    $message = "🤖 <b>Binance Bot Alert (RSI Strategy)</b>\n"
                             . "✅ Test Trade Executed\n"
                             . "<b>Action:</b> {$action}\n"
                             . "<b>Symbol:</b> {$symbol}\n"
                             . "<b>Price:</b> " . number_format($currentPrice, 2) . " THB\n"
                             . "<b>RSI (14):</b> {$rsiFormatted}";
                    $this->sendTelegramAlert($message);
                }
            }

        } catch (\Exception $e) {
            Log::error('TradeBot Error: ' . $e->getMessage());
        }

        Log::info('TradeBot: Cycle completed.');
    }

    private function fetchBinanceClosingPrices(string $symbol, string $interval, int $limit): array
    {
        $response = Http::get("{$this->baseUrl}/api/v3/klines", [
            'symbol' => $symbol,
            'interval' => $interval,
            'limit' => $limit
        ]);

        if ($response->successful()) {
            $klines = $response->json();
            $closes = [];
            foreach ($klines as $kline) {
                $closes[] = (float) $kline[4]; // Index 4 is the Closing Price
            }
            return $closes;
        }

        throw new \Exception("Failed to fetch klines: " . $response->body());
    }

    private function calculateRSI(array $closes, int $period = 14): float
    {
        if (count($closes) < $period + 1) return 50.0;

        $gains = 0.0;
        $losses = 0.0;

        // Calculate initial average gain/loss
        for ($i = 1; $i <= $period; $i++) {
            $change = $closes[$i] - $closes[$i - 1];
            if ($change > 0) {
                $gains += $change;
            } else {
                $losses += abs($change);
            }
        }

        $avgGain = $gains / $period;
        $avgLoss = $losses / $period;

        // Smooth the rest of the values (Wilder's Smoothing Method)
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

    private function executeTestTrade(string $symbol, string $action): bool
    {
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');

        if (!$apiKey || !$apiSecret) {
            Log::warning("TradeBot: API Keys missing. Cannot execute trade.");
            return false;
        }

        $timestamp = (int) (microtime(true) * 1000);
        $params = [
            'symbol' => $symbol,
            'side' => $action, // 'BUY' or 'SELL'
            'type' => 'MARKET',
            'quantity' => 0.001, // Example quantity
            'timestamp' => $timestamp,
        ];

        // Generate HMAC SHA256 Signature
        $queryString = http_build_query($params);
        $signature = hash_hmac('sha256', $queryString, $apiSecret);
        $params['signature'] = $signature;

        $response = Http::withHeaders([
            'X-MBX-APIKEY' => $apiKey
        ])->post("{$this->baseUrl}/api/v3/order/test", $params);

        if ($response->successful()) {
            Log::info("TradeBot: Test trade execution successful.");
            return true;
        }

        Log::error("TradeBot: Trade execution failed: " . $response->body());
        return false;
    }

    private function logTradeToDynamoDB(string $symbol, string $action, float $price)
    {
        $tableName = env('DYNAMODB_TABLE');
        if (!$tableName) {
            Log::warning('TradeBot: DYNAMODB_TABLE not set, skipping DB log.');
            return;
        }

        $client = new DynamoDbClient([
            'region'  => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
            'version' => 'latest'
        ]);

        $tradeId = uniqid('trade_');

        try {
            $client->putItem([
                'TableName' => $tableName,
                'Item' => [
                    'id'        => ['S' => $tradeId],
                    'symbol'    => ['S' => $symbol],
                    'action'    => ['S' => $action],
                    'price'     => ['N' => (string) $price],
                    'timestamp' => ['N' => (string) time()]
                ]
            ]);

            Log::info("TradeBot: Trade {$tradeId} logged to DynamoDB successfully.");
        } catch (AwsException $e) {
            Log::error("TradeBot: DynamoDB Error - " . $e->getAwsErrorMessage());
        }
    }

    private function sendTelegramAlert(string $message)
    {
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) {
            Log::warning('TradeBot: Telegram credentials not set. Skipping notification.');
            return;
        }

        try {
            Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML'
            ]);
            Log::info('TradeBot: Telegram alert sent.');
        } catch (\Exception $e) {
            Log::error('TradeBot: Failed to send Telegram alert: ' . $e->getMessage());
        }
    }
}
