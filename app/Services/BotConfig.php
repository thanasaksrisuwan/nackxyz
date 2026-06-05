<?php
namespace App\Services;

use Aws\DynamoDb\DynamoDbClient;
use Illuminate\Support\Facades\Log;

class BotConfig
{
    public static function getClient()
    {
        return new DynamoDbClient([
            'region' => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
            'version' => 'latest',
        ]);
    }

    public static function get()
    {
        try {
            $client = self::getClient();
            $table = env('DYNAMODB_TABLE');
            if (!$table) return self::getDefaults();

            $result = $client->getItem([
                'TableName' => $table,
                'Key' => [
                    'id' => ['S' => 'bot_config']
                ]
            ]);

            if (isset($result['Item']['config_json']['S'])) {
                $config = json_decode($result['Item']['config_json']['S'], true);
                return array_merge(self::getDefaults(), $config ?? []);
            }
        } catch (\Exception $e) {
            Log::error("BotConfig get error: " . $e->getMessage());
        }
        return self::getDefaults();
    }

    public static function set(array $config)
    {
        try {
            $client = self::getClient();
            $table = env('DYNAMODB_TABLE');
            if (!$table) return false;

            $client->putItem([
                'TableName' => $table,
                'Item' => [
                    'id' => ['S' => 'bot_config'],
                    'config_json' => ['S' => json_encode($config)]
                ]
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error("BotConfig set error: " . $e->getMessage());
            return false;
        }
    }

    public static function getDefaults()
    {
        return [
            'rsi_buy' => 30,
            'rsi_sell' => 70,
            'trade_amount_usdt' => 15.0,
            'use_ema_filter' => true,
        ];
    }
}
