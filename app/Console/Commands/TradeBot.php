<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Aws\DynamoDb\DynamoDbClient;
use Aws\Exception\AwsException;
use App\Services\BotConfig;

class TradeBot extends Command
{
    protected $signature = 'trade:run';
    protected $description = 'Execute the Binance TH RSI trading bot logic securely';

    private function getBaseUrl(): string {
        return env('BINANCE_BASE_URL', 'https://api.binance.th');
    }
    
    public function handle()
    {
        Log::info('TradeBot: Starting RSI trading cycle...');

        // ---- Load all settings from DynamoDB (set via Dashboard UI) ----
        $config           = BotConfig::get();
        $targetBudgetUsdt = (float)  ($config['trade_amount_usdt'] ?? 15.0);
        $rsiBuy           = (float)  ($config['rsi_buy']           ?? 30);
        $rsiSell          = (float)  ($config['rsi_sell']          ?? 70);
        $useEmaFilter     = (bool)   ($config['use_ema_filter']    ?? true);
        $symbol           = strtoupper(trim($config['symbol']      ?? 'WLDUSDT'));
        $interval         = strtolower(trim($config['timeframe']   ?? '15m'));
        $dailyMaxLossUsdt = (float)  ($config['daily_max_loss_usdt'] ?? 5.0);
        $drawdownLimitPct = (float)  ($config['drawdown_limit_pct']  ?? 10.0);

        // Derive base/quote from symbol (e.g. BTCUSDT -> BTC, USDT)
        $quoteAsset = 'USDT';
        $baseAsset  = str_replace($quoteAsset, '', $symbol); // e.g. BTC, WLD, ETH

        Log::info("TradeBot: Config loaded — Symbol: {$symbol} | Timeframe: {$interval} | RSI Buy<{$rsiBuy} Sell>{$rsiSell} | Budget: {$targetBudgetUsdt} USDT | EMA Filter: " . ($useEmaFilter ? 'ON' : 'OFF') . " | Daily Max Loss: {$dailyMaxLossUsdt} USDT | Drawdown Limit: {$drawdownLimitPct}%");

        try {
            // 1. Fetch historical closing prices (need 300 bars for EMA200)
            $closes = $this->fetchBinanceClosingPrices($symbol, $interval, 300);
            if (count($closes) < 200) {
                Log::warning('TradeBot: Not enough data to calculate EMA 200 and RSI.');
                return;
            }

            $currentPrice = end($closes);

            // 2. Calculate RSI(14) & EMA 200
            $rsi          = $this->calculateRSI($closes, 14);
            $rsiFormatted = number_format($rsi, 2);
            $ema200       = $this->calculateEMA($closes, 200);
            $emaFormatted = number_format($ema200, 6);

            Log::info("TradeBot: {$symbol} Price={$currentPrice} | RSI={$rsiFormatted} | EMA200={$emaFormatted}");

            // 3. Position State — check real balance instead of local state
            $balances    = $this->fetchAccountBalances();
            if ($balances === []) {
                Log::warning('TradeBot: Account balances unavailable. Skipping cycle to avoid blind order execution.');
                return;
            }

            $baseBalance = $balances[$baseAsset] ?? 0.0;

            // "In position" if our base asset is worth more than $5
            $positionValue    = $baseBalance * $currentPrice;
            $isHoldingPosition = $positionValue > 5.0;
            $portfolioEquityUsdt = $this->calculatePortfolioEquity($balances, $baseAsset, $currentPrice);
            Log::info("TradeBot: Holding {$baseBalance} {$baseAsset} (~{$positionValue} USDT). Equity={$portfolioEquityUsdt} USDT. State: " . ($isHoldingPosition ? 'IN POSITION' : 'FLAT'));

            // 4. Stop-Loss Guard — protect against runaway loss (-5%)
            if ($isHoldingPosition) {
                $lastBuyPrice = $this->getLastBuyPrice($symbol);
                if ($lastBuyPrice > 0) {
                    $pnlPct = (($currentPrice - $lastBuyPrice) / $lastBuyPrice) * 100;
                    if ($pnlPct <= -5.0) {
                        Log::warning("TradeBot: STOP-LOSS triggered! PnL={$pnlPct}% — forcing SELL to cut losses.");
                        $quantity = $this->calcQuantity($baseAsset, $baseBalance);
                        if ($quantity > 0) {
                            $tradeSuccess = $this->executeLiveTrade($symbol, 'SELL', $quantity);
                            if ($tradeSuccess) {
                                $this->logTradeToDynamoDB($symbol, 'STOP_LOSS', $currentPrice, $quantity);
                                $this->sendTelegramAlert(
                                    "🛑 <b>STOP-LOSS Hit</b>\n"
                                    . "<b>Symbol:</b> {$symbol}\n"
                                    . "<b>PnL:</b> " . number_format($pnlPct, 2) . "%\n"
                                    . "<b>Sold:</b> {$quantity} {$baseAsset} @ " . number_format($currentPrice, 6)
                                );
                            }
                        }
                        Log::info('TradeBot: Cycle completed (Stop-Loss).');
                        return;
                    }
                }
            }

            // 5. Circuit breakers. Stop normal strategy before opening new risk.
            $riskState = $this->updateRiskCircuitState($config, $portfolioEquityUsdt);
            Log::info(
                "TradeBot: Risk state DailyLoss={$riskState['daily_loss_usdt']} USDT | "
                . "Drawdown={$riskState['current_drawdown_pct']}% | Peak={$riskState['equity_peak_usdt']} USDT"
            );

            if ($riskState['is_paused']) {
                Log::warning("TradeBot: Circuit breaker active ({$riskState['pause_code']}): {$riskState['pause_reason']}. Skipping strategy execution.");
                if (!empty($riskState['just_paused'])) {
                    $this->sendTelegramAlert(
                        "🚨 <b>TradeBot Paused</b>\n"
                        . "<b>Reason:</b> {$riskState['pause_reason']}\n"
                        . "<b>Equity:</b> " . number_format($portfolioEquityUsdt, 4) . " USDT\n"
                        . "<b>Daily Loss:</b> " . number_format($riskState['daily_loss_usdt'], 4) . " USDT\n"
                        . "<b>Drawdown:</b> " . number_format($riskState['current_drawdown_pct'], 2) . "%"
                    );
                }
                Log::info('TradeBot: Cycle completed (circuit breaker).');
                return;
            }

            // 6. Trading Logic Evaluation
            $action = 'HOLD';

            if ($rsi < $rsiBuy && !$isHoldingPosition) {
                if (!$useEmaFilter || $currentPrice > $ema200) {
                    Log::info("TradeBot: BUY signal — RSI {$rsiFormatted} < {$rsiBuy}, trend filter passed.");
                    $action = 'BUY';
                } else {
                    Log::info("TradeBot: RSI oversold but price {$currentPrice} <= EMA200 {$emaFormatted}. HOLD (bearish trend).");
                }
            } elseif ($rsi > $rsiSell && $isHoldingPosition) {
                $averageEntryPrice = $this->getLastBuyPrice($symbol);
                // Require at least 0.5% profit to cover 0.2% × 2 round-trip fee
                $minProfitFactor   = 1.005;

                if ($averageEntryPrice > 0 && $currentPrice >= ($averageEntryPrice * $minProfitFactor)) {
                    $action = 'SELL';
                } elseif ($averageEntryPrice <= 0) {
                    $action = 'SELL'; // Fallback: no buy record found
                } else {
                    $target = number_format($averageEntryPrice * $minProfitFactor, 6);
                    Log::info("TradeBot: RSI overbought but price {$currentPrice} < target {$target}. HOLD.");
                }
            }

            Log::info("TradeBot: Decision => {$action}");

            // 7. Execute Trade
            if ($action !== 'HOLD') {
                if ($action === 'BUY') {
                    $quantity = $this->calcQuantity($baseAsset, null, $targetBudgetUsdt, $currentPrice);
                } else {
                    $quantity = $this->calcQuantity($baseAsset, $baseBalance);
                }

                if ($quantity <= 0) {
                    Log::error("TradeBot: Calculated quantity is 0. Skipping trade.");
                    Log::info('TradeBot: Cycle completed (zero qty).');
                    return;
                }

                $tradeSuccess = $this->executeLiveTrade($symbol, $action, $quantity);

                if ($tradeSuccess) {
                    $this->logTradeToDynamoDB($symbol, $action, $currentPrice, $quantity);

                    $emoji   = $action === 'BUY' ? '🟢' : '🔴';
                    $message = "🤖 <b>TradeBot Alert</b>\n"
                             . "{$emoji} <b>{$action}</b> executed\n"
                             . "<b>Symbol:</b> {$symbol}\n"
                             . "<b>Price:</b> " . number_format($currentPrice, 6) . " {$quoteAsset}\n"
                             . "<b>Qty:</b> {$quantity} {$baseAsset}\n"
                             . "<b>RSI(14):</b> {$rsiFormatted}\n"
                             . "<b>EMA200:</b> {$emaFormatted}";
                    $this->sendTelegramAlert($message);
                }
            }

        } catch (\Exception $e) {
            Log::error('TradeBot Error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
        }

        Log::info('TradeBot: Cycle completed.');
    }

    /**
     * Calculate trade quantity with correct decimal precision per asset.
     * BUY  -> pass $budgetUsdt + $price; $balance stays null
     * SELL -> pass $balance; budget/price stay null
     */
    private function calcQuantity(string $baseAsset, ?float $balance = null, ?float $budgetUsdt = null, ?float $price = null): float
    {
        // Decimal precision map (step size per asset on Binance TH)
        $precisionMap = [
            'BTC'  => 5, // 0.00001
            'ETH'  => 4, // 0.0001
            'BNB'  => 3, // 0.001
            'SOL'  => 2, // 0.01
            'ADA'  => 1, // 0.1
            'XRP'  => 1,
            'DOT'  => 2,
            'WLD'  => 1,
        ];
        $decimals  = $precisionMap[$baseAsset] ?? 2;
        $multiplier = 10 ** $decimals;

        if ($budgetUsdt !== null && $price !== null && $price > 0) {
            // BUY: how many units can we buy for $budgetUsdt?
            return floor(($budgetUsdt / $price) * $multiplier) / $multiplier;
        }

        if ($balance !== null) {
            // SELL: floor the entire balance to the correct precision
            return floor($balance * $multiplier) / $multiplier;
        }

        return 0.0;
    }

    private function calculatePortfolioEquity(array $balances, string $baseAsset, float $currentPrice): float
    {
        $usdtBalance = $balances['USDT'] ?? 0.0;
        $baseBalance = $balances[$baseAsset] ?? 0.0;

        return round($usdtBalance + ($baseBalance * $currentPrice), 8);
    }

    private function updateRiskCircuitState(array $config, float $currentEquityUsdt): array
    {
        $state = BotConfig::getState();
        $today = now(config('app.timezone', 'UTC'))->toDateString();

        $dailyMaxLossUsdt = max(0.0, (float) ($config['daily_max_loss_usdt'] ?? 0.0));
        $drawdownLimitPct = max(0.0, (float) ($config['drawdown_limit_pct'] ?? 0.0));

        $previousPaused = (bool) ($state['is_paused'] ?? false);
        $previousCode = (string) ($state['pause_code'] ?? '');
        $isNewDay = ($state['daily_loss_date'] ?? '') !== $today;

        if ($isNewDay) {
            $state['daily_loss_date'] = $today;
            $state['daily_start_equity_usdt'] = $currentEquityUsdt;
            $state['daily_loss_usdt'] = 0.0;

            if ($previousCode === 'DAILY_MAX_LOSS') {
                $previousPaused = false;
                $previousCode = '';
            }
        }

        if (($state['daily_start_equity_usdt'] ?? 0.0) <= 0 && $currentEquityUsdt > 0) {
            $state['daily_start_equity_usdt'] = $currentEquityUsdt;
        }

        $dailyStartEquity = (float) ($state['daily_start_equity_usdt'] ?? 0.0);
        $dailyLossUsdt = max(0.0, $dailyStartEquity - $currentEquityUsdt);

        $equityPeakUsdt = (float) ($state['equity_peak_usdt'] ?? 0.0);
        if ($currentEquityUsdt > $equityPeakUsdt) {
            $equityPeakUsdt = $currentEquityUsdt;
        }
        if ($equityPeakUsdt <= 0 && $currentEquityUsdt > 0) {
            $equityPeakUsdt = $currentEquityUsdt;
        }

        $currentDrawdownPct = $equityPeakUsdt > 0
            ? max(0.0, (($equityPeakUsdt - $currentEquityUsdt) / $equityPeakUsdt) * 100)
            : 0.0;

        $pauseCode = '';
        $pauseReason = '';

        if ($previousPaused && $previousCode === 'DAILY_MAX_LOSS' && !$isNewDay) {
            $pauseCode = 'DAILY_MAX_LOSS';
            $pauseReason = $state['pause_reason'] ?: 'Daily max loss reached. Bot paused until next trading day.';
        } elseif ($dailyMaxLossUsdt > 0 && $dailyLossUsdt >= $dailyMaxLossUsdt) {
            $pauseCode = 'DAILY_MAX_LOSS';
            $pauseReason = 'Daily loss ' . number_format($dailyLossUsdt, 4) . ' USDT reached limit '
                . number_format($dailyMaxLossUsdt, 4) . ' USDT.';
        } elseif ($drawdownLimitPct > 0 && $currentDrawdownPct >= $drawdownLimitPct) {
            $pauseCode = 'DRAWDOWN_LIMIT';
            $pauseReason = 'Drawdown ' . number_format($currentDrawdownPct, 2) . '% reached limit '
                . number_format($drawdownLimitPct, 2) . '%.';
        }

        $state['is_paused'] = $pauseCode !== '';
        $state['pause_code'] = $pauseCode;
        $state['pause_reason'] = $pauseReason;
        $state['daily_loss_usdt'] = round($dailyLossUsdt, 4);
        $state['daily_start_equity_usdt'] = round($dailyStartEquity, 4);
        $state['daily_loss_date'] = $today;
        $state['equity_peak_usdt'] = round($equityPeakUsdt, 4);
        $state['current_drawdown_pct'] = round($currentDrawdownPct, 4);
        $state['last_equity_usdt'] = round($currentEquityUsdt, 4);
        $state['updated_at'] = date('c');

        $state['just_paused'] = $state['is_paused'] && (!$previousPaused || $previousCode !== $pauseCode);

        BotConfig::setState($state);

        return $state;
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
                $balances[$asset['asset']] = (float)($asset['free'] ?? 0) + (float)($asset['locked'] ?? 0);
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

    private function getLastBuyPrice(string $symbol): float
    {
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');
        
        if (!$apiKey || !$apiSecret) return 0.0;

        $timestamp = (int) (microtime(true) * 1000);
        $queryString = "symbol={$symbol}&limit=50&recvWindow=10000&timestamp={$timestamp}";
        $signature = hash_hmac('sha256', $queryString, $apiSecret);

        $response = Http::withHeaders([
            'X-MBX-APIKEY' => $apiKey
        ])->get("{$this->getBaseUrl()}/api/v1/userTrades", [
            'symbol' => $symbol,
            'limit' => 50,
            'recvWindow' => 10000,
            'timestamp' => $timestamp,
            'signature' => $signature
        ]);

        if ($response->successful()) {
            $trades = $response->json();
            // Sort trades by newest first
            usort($trades, function($a, $b) {
                return $b['time'] <=> $a['time'];
            });
            
            // Find the most recent BUY trade
            foreach ($trades as $trade) {
                if ($trade['isBuyer']) {
                    return (float) $trade['price'];
                }
            }
        }
        
        return 0.0;
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

    private function calculateEMA(array $closes, int $period = 200): float
    {
        if (count($closes) < $period) return end($closes);

        $multiplier = 2 / ($period + 1);
        
        // Start with SMA of the first $period elements
        $sma = array_sum(array_slice($closes, 0, $period)) / $period;
        $ema = $sma;

        // Calculate EMA for the rest of the array
        for ($i = $period; $i < count($closes); $i++) {
            $ema = ($closes[$i] - $ema) * $multiplier + $ema;
        }

        return $ema;
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
