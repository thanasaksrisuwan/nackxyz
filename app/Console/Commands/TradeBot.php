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
    protected $description = 'Execute the Binance TH trading bot logic and log to DynamoDB';

    private $baseUrl = 'https://api.binance.th';

    public function handle()
    {
        Log::info('TradeBot: Starting trading cycle...');

        try {
            $symbol = 'BTCTHB'; // Trading pair on Binance TH

            // 1. Fetch Real Price from Binance TH
            $price = $this->fetchBinancePrice($symbol);
            Log::info("TradeBot: Current {$symbol} price is {$price} THB");

            // 2. Trading Logic Evaluation (Customize this strategy!)
            $action = 'HOLD';
            // Example Strategy: 
            // Buy if BTC is extremely cheap (just an example threshold)
            if ($price < 2000000) {
                $action = 'BUY';
            } elseif ($price > 2500000) {
                $action = 'SELL';
            }

            Log::info("TradeBot: Decision made -> {$action}");

            // 3. Execute Trade (Using TEST endpoint so it won't use real money yet)
            if ($action !== 'HOLD') {
                $tradeSuccess = $this->executeTestTrade($symbol, $action);
                
                // 4. Save to DynamoDB
                if ($tradeSuccess) {
                    $this->logTradeToDynamoDB($symbol, $action, $price);
                }
            }

        } catch (\Exception $e) {
            Log::error('TradeBot Error: ' . $e->getMessage());
        }

        Log::info('TradeBot: Cycle completed.');
    }

    private function fetchBinancePrice(string $symbol): float
    {
        $response = Http::get("{$this->baseUrl}/api/v3/ticker/price", [
            'symbol' => $symbol
        ]);

        if ($response->successful()) {
            return (float) $response->json('price');
        }

        throw new \Exception("Failed to fetch price: " . $response->body());
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

        // Use /api/v3/order/test to VALIDATE the order without actually buying/selling
        // Change to /api/v3/order when you want to trade real money.
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
}
