<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;


use App\Services\BotConfig;

class DashboardController extends Controller
{
    private $baseUrl = 'https://api.binance.th';

    public function index()
    {
        $botConfig = BotConfig::get();
        $botState = BotConfig::getState();

        // --- Read active symbol/timeframe from saved config ---
        $activeSymbol  = $botConfig['symbol']    ?? 'WLDUSDT';
        $timeframe     = $botConfig['timeframe']  ?? '15m';

        $baseUrl = env('BINANCE_BASE_URL', 'https://api.binance.th');
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');
        $error = null;
        $balances = [];
        $wldPrice = 0;
        $priceChange24h = 0;
        $priceChangePercent = 0;
        $rsi = 50;
        $trades = [];
        $klines = [];

        if (!$apiKey || !$apiSecret) {
            $error = 'API Keys missing. Please configure BINANCE_API_KEY and BINANCE_API_SECRET.';
        } else {
            // 1. Fetch Balances
            try {
                $timestamp = (int) (microtime(true) * 1000);
                $queryString = "timestamp={$timestamp}";
                $signature = hash_hmac('sha256', $queryString, $apiSecret);

                $response = Http::withHeaders([
                    'X-MBX-APIKEY' => $apiKey
                ])->get("{$baseUrl}/api/v1/accountV2", [
                    'timestamp' => $timestamp,
                    'signature' => $signature
                ]);

                if ($response->successful()) {
                    $accountData = $response->json();
                    foreach ($accountData['balances'] as $asset) {
                        if ((float)$asset['free'] > 0 || (float)$asset['locked'] > 0) {
                            $balances[] = $asset;
                        }
                    }
                } else {
                    $error = 'Binance API Error: ' . $response->body();
                }
            } catch (\Exception $e) {
                $error = 'Exception: ' . $e->getMessage();
            }

            // 2. Fetch active symbol 24h Ticker
            try {
                $tickerResp = Http::get("{$baseUrl}/api/v1/ticker/24hr", [
                    'symbol' => $activeSymbol
                ]);
                if ($tickerResp->successful()) {
                    $wldPrice = (float) $tickerResp->json('lastPrice');
                    $priceChange24h = (float) $tickerResp->json('priceChange');
                    $priceChangePercent = (float) $tickerResp->json('priceChangePercent');
                }
            } catch (\Exception $e) { }

            // 3. Calculate RSI(14) using configured symbol & timeframe
            try {
                $klinesResp = Http::get("{$baseUrl}/api/v1/klines", [
                    'symbol'   => $activeSymbol,
                    'interval' => $timeframe,
                    'limit'    => 100
                ]);
                if ($klinesResp->successful()) {
                    $klines = $klinesResp->json();
                    if (is_array($klines) && count($klines) >= 15) {
                        $closes = array_map(fn($k) => (float)($k[4] ?? 0), $klines);
                        $rsi = $this->calculateRSI($closes, 14);
                    } else {
                        $klines = [];
                    }
                }
            } catch (\Exception $e) {}

            // 4. Fetch Trade History from Binance API (Single Source of Truth)
            try {
                $queryStringTrades = "symbol={$activeSymbol}&timestamp={$timestamp}";
                $signatureTrades = hash_hmac('sha256', $queryStringTrades, $apiSecret);

                $tradesResp = Http::withHeaders([
                    'X-MBX-APIKEY' => $apiKey
                ])->get("{$baseUrl}/api/v1/userTrades", [
                    'symbol'    => $activeSymbol,
                    'timestamp' => $timestamp,
                    'signature' => $signatureTrades
                ]);

                if ($tradesResp->successful()) {
                    $items = $tradesResp->json();
                    
                    if (is_array($items) && !isset($items['code'])) {
                        // Sort descending by time
                        usort($items, function($a, $b) {
                            return ($b['time'] ?? 0) <=> ($a['time'] ?? 0);
                        });
                        
                        $processedTrades = [];
                        foreach (array_slice($items, 0, 15) as $item) {
                            $qty = (float)($item['qty'] ?? 0);
                            $prc = (float)($item['price'] ?? 0);
                            $grossValue = $qty * $prc;

                            $commission = (float)($item['commission'] ?? 0.0);
                            $commissionAsset = $item['commissionAsset'] ?? 'USDT';
                            
                            $feeInUsdt = 0.0;
                            if ($commissionAsset === 'USDT') {
                                $feeInUsdt = $commission;
                            } elseif ($commissionAsset === 'WLD') {
                                $feeInUsdt = $commission * $prc;
                            } elseif ($commissionAsset === 'BNB') {
                                // Rough estimation if BNB is around $600
                                $feeInUsdt = $commission * 600.0;
                            }

                            $item['feeUsdt'] = $feeInUsdt;
                            $item['netValue'] = isset($item['isBuyer']) && $item['isBuyer'] ? ($grossValue + $feeInUsdt) : ($grossValue - $feeInUsdt);
                            $processedTrades[] = $item;
                        }
                        $trades = $processedTrades;
                    }
                }
            } catch (\Exception $e) {
                // Ignore
            }
        }

        // Calculate total portfolio value roughly
        // Derive base asset from active symbol (e.g. BTCUSDT -> BTC, WLDUSDT -> WLD)
        $baseAsset = str_replace('USDT', '', $activeSymbol);
        $totalUsdtValue = 0;
        foreach ($balances as &$b) {
            $amt = (float)($b['free'] ?? 0) + (float)($b['locked'] ?? 0);
            if (($b['asset'] ?? '') === 'USDT') {
                $b['usdtValue'] = $amt;
            } elseif (($b['asset'] ?? '') === $baseAsset) {
                $b['usdtValue'] = $amt * $wldPrice;
            } else {
                $b['usdtValue'] = 0;
            }
            $totalUsdtValue += $b['usdtValue'];
        }

        $data = compact(
            'balances', 'wldPrice', 'priceChange24h', 'priceChangePercent',
            'rsi', 'trades', 'totalUsdtValue', 'error', 'botConfig', 'botState',
            'activeSymbol', 'timeframe'
        );

        // Pass klines array specifically for the frontend chart
        $safeKlines = is_array($klines) ? $klines : [];
        $data['klinesChart'] = array_map(function($k) {
            return [
                'time'  => ($k[0] ?? 0) / 1000,
                'open'  => (float)($k[1] ?? 0),
                'high'  => (float)($k[2] ?? 0),
                'low'   => (float)($k[3] ?? 0),
                'close' => (float)($k[4] ?? 0),
            ];
        }, $safeKlines);

        if (request()->wantsJson() || request()->ajax()) {
            return response()->json($data);
        }

        return view('welcome', $data);
    }

    public function saveConfig(Request $request)
    {
        // Allowed symbols on Binance TH
        $allowedSymbols    = ['WLDUSDT', 'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT'];
        $allowedTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

        $validated = $request->validate([
            'rsi_buy'            => 'required|numeric|min:10|max:50',
            'rsi_sell'           => 'required|numeric|min:50|max:90',
            'trade_amount_usdt'  => 'required|numeric|min:10|max:1000',
            'use_ema_filter'     => 'required|boolean',
            'symbol'             => 'required|string|in:' . implode(',', $allowedSymbols),
            'timeframe'          => 'required|string|in:' . implode(',', $allowedTimeframes),
            'daily_max_loss_usdt'=> 'required|numeric|min:1|max:100000',
            'drawdown_limit_pct' => 'required|numeric|min:1|max:80',
            'available_symbols'  => 'sometimes|array',
            'available_symbols.*'=> 'string|in:' . implode(',', $allowedSymbols),
        ]);

        $success = BotConfig::set([
            'rsi_buy'           => (float) $validated['rsi_buy'],
            'rsi_sell'          => (float) $validated['rsi_sell'],
            'trade_amount_usdt' => (float) $validated['trade_amount_usdt'],
            'use_ema_filter'    => (bool) $validated['use_ema_filter'],
            'symbol'            => $validated['symbol'],
            'timeframe'         => $validated['timeframe'],
            'daily_max_loss_usdt' => (float) $validated['daily_max_loss_usdt'],
            'drawdown_limit_pct' => (float) $validated['drawdown_limit_pct'],
            'available_symbols' => $validated['available_symbols'] ?? ['WLDUSDT', 'BTCUSDT'],
        ]);

        return response()->json(['success' => $success]);
    }

    private function calculateRSI(array $closes, int $period = 14): float
    {
        if (count($closes) <= $period) return 50.0;
        
        $gains = 0; $losses = 0;
        for ($i = 1; $i <= $period; $i++) {
            $change = $closes[$i] - $closes[$i - 1];
            if ($change > 0) $gains += $change;
            else $losses += abs($change);
        }
        
        $avgGain = $gains / $period;
        $avgLoss = $losses / $period;
        if ($avgLoss == 0) return 100.0;
        
        $rs = $avgGain / $avgLoss;
        return 100.0 - (100.0 / (1.0 + $rs));
    }
}
