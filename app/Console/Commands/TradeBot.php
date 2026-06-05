<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Aws\DynamoDb\DynamoDbClient;
use Aws\Exception\AwsException;

class TradeBot extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trade:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute the Binance trading bot logic and log to DynamoDB';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('TradeBot: Starting trading cycle...');

        try {
            // 1. Fetch Price from Binance (Mock or real implementation)
            $price = $this->fetchBinancePrice('BTCUSDT');
            Log::info("TradeBot: Current BTCUSDT price is {$price}");

            // 2. Trading Logic Evaluation
            // Example: Buy if price drops below a threshold, sell if it rises
            $action = 'HOLD';
            if ($price < 60000) {
                $action = 'BUY';
            } elseif ($price > 70000) {
                $action = 'SELL';
            }

            Log::info("TradeBot: Decision made -> {$action}");

            // 3. Save to DynamoDB
            if ($action !== 'HOLD') {
                $this->logTradeToDynamoDB('BTCUSDT', $action, $price);
            }

        } catch (\Exception $e) {
            Log::error('TradeBot Error: ' . $e->getMessage());
        }

        Log::info('TradeBot: Cycle completed.');
    }

    private function fetchBinancePrice(string $symbol): float
    {
        // For production, use Guzzle or a Binance SDK to fetch real price
        // Mocking a price for lab purposes
        return rand(59000, 71000);
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
            $result = $client->putItem([
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
