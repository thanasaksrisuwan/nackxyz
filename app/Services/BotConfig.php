<?php
namespace App\Services;

use Aws\DynamoDb\DynamoDbClient;
use Illuminate\Support\Facades\Log;

class BotConfig
{
    public static function getClient(): DynamoDbClient
    {
        return new DynamoDbClient([
            'region'  => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
            'version' => 'latest',
        ]);
    }

    // ── Trading Config ────────────────────────────────────────────────────

    public static function get(): array
    {
        try {
            $client = self::getClient();
            $table  = env('DYNAMODB_TABLE');
            if (!$table) return self::getDefaults();

            $result = $client->getItem([
                'TableName' => $table,
                'Key'       => ['id' => ['S' => 'bot_config']],
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

    public static function set(array $config): bool
    {
        try {
            $client = self::getClient();
            $table  = env('DYNAMODB_TABLE');
            if (!$table) return false;

            $client->putItem([
                'TableName' => $table,
                'Item'      => [
                    'id'          => ['S' => 'bot_config'],
                    'config_json' => ['S' => json_encode($config)],
                ],
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error("BotConfig set error: " . $e->getMessage());
            return false;
        }
    }

    public static function getDefaults(): array
    {
        return [
            'rsi_buy'             => 30,
            'rsi_sell'            => 70,
            'trade_amount_usdt'   => 15.0,
            'use_ema_filter'      => true,
            'symbol'              => 'WLDUSDT',
            'timeframe'           => '15m',
            'available_symbols'   => [
                'WLDUSDT',
                'BTCUSDT',
            ],
            'daily_max_loss_usdt' => 5.0,   // Circuit breaker: stop if daily loss >= $5
            'drawdown_limit_pct'  => 10.0,  // Circuit breaker: stop if drawdown >= 10% from peak
        ];
    }

    // ── Bot Runtime State ─────────────────────────────────────────────────

    public static function getState(): array
    {
        try {
            $client = self::getClient();
            $table  = env('DYNAMODB_TABLE');
            if (!$table) return self::getDefaultState();

            $result = $client->getItem([
                'TableName' => $table,
                'Key'       => ['id' => ['S' => 'bot_state']],
            ]);

            if (isset($result['Item'])) {
                $item = $result['Item'];
                return [
                    'is_paused'        => ($item['is_paused']['S']        ?? 'false') === 'true',
                    'pause_code'       =>  $item['pause_code']['S']       ?? '',
                    'pause_reason'     =>  $item['pause_reason']['S']     ?? '',
                    'daily_loss_usdt'  => (float)($item['daily_loss_usdt']['N']  ?? 0),
                    'daily_start_equity_usdt' => (float)($item['daily_start_equity_usdt']['N'] ?? 0),
                    'daily_loss_date'  =>  $item['daily_loss_date']['S']  ?? date('Y-m-d'),
                    'equity_peak_usdt' => (float)($item['equity_peak_usdt']['N'] ?? 0),
                    'current_drawdown_pct' => (float)($item['current_drawdown_pct']['N'] ?? 0),
                    'last_equity_usdt' => (float)($item['last_equity_usdt']['N'] ?? 0),
                    'updated_at'       =>  $item['updated_at']['S']       ?? '',
                ];
            }
        } catch (\Exception $e) {
            Log::error("BotConfig getState error: " . $e->getMessage());
        }
        return self::getDefaultState();
    }

    public static function setState(array $state): void
    {
        try {
            $client = self::getClient();
            $table  = env('DYNAMODB_TABLE');
            if (!$table) return;

            $client->putItem([
                'TableName' => $table,
                'Item'      => [
                    'id'               => ['S' => 'bot_state'],
                    'is_paused'        => ['S' => ($state['is_paused'] ?? false) ? 'true' : 'false'],
                    'pause_code'       => ['S' => $state['pause_code']      ?? ''],
                    'pause_reason'     => ['S' => $state['pause_reason']     ?? ''],
                    'daily_loss_usdt'  => ['N' => (string) round($state['daily_loss_usdt']  ?? 0, 4)],
                    'daily_start_equity_usdt' => ['N' => (string) round($state['daily_start_equity_usdt'] ?? 0, 4)],
                    'daily_loss_date'  => ['S' => $state['daily_loss_date']  ?? date('Y-m-d')],
                    'equity_peak_usdt' => ['N' => (string) round($state['equity_peak_usdt'] ?? 0, 4)],
                    'current_drawdown_pct' => ['N' => (string) round($state['current_drawdown_pct'] ?? 0, 4)],
                    'last_equity_usdt' => ['N' => (string) round($state['last_equity_usdt'] ?? 0, 4)],
                    'updated_at'       => ['S' => $state['updated_at'] ?? date('c')],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("BotConfig setState error: " . $e->getMessage());
        }
    }

    /** Clear the paused flag so the bot resumes next cycle. */
    public static function resume(): void
    {
        $state                 = self::getState();
        $state['is_paused']    = false;
        $state['pause_code']   = '';
        $state['pause_reason'] = '';
        self::setState($state);
    }

    public static function getDefaultState(): array
    {
        return [
            'is_paused'        => false,
            'pause_code'       => '',
            'pause_reason'     => '',
            'daily_loss_usdt'  => 0.0,
            'daily_start_equity_usdt' => 0.0,
            'daily_loss_date'  => date('Y-m-d'),
            'equity_peak_usdt' => 0.0,
            'current_drawdown_pct' => 0.0,
            'last_equity_usdt' => 0.0,
            'updated_at'       => '',
        ];
    }
}
