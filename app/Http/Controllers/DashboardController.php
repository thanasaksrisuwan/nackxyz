<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use Aws\DynamoDb\DynamoDbClient;
use Aws\Exception\AwsException;

class DashboardController extends Controller
{
    private $baseUrl = 'https://api.binance.th';

    public function index()
    {
        $baseUrl = env('BINANCE_BASE_URL', 'https://api.binance.th');
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');
        $error = null;
        $balances = [];
        $wldPrice = 0;
        $priceChange24h = 0;
        $priceChangePercent = 0;
        $rsi = 50; // default middle
        $trades = [];

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

            // 2. Fetch WLDUSDT 24h Ticker
            try {
                $tickerResp = Http::get("{$baseUrl}/api/v1/ticker/24hr", [
                    'symbol' => 'WLDUSDT'
                ]);
                if ($tickerResp->successful()) {
                    $wldPrice = (float) $tickerResp->json('lastPrice');
                    $priceChange24h = (float) $tickerResp->json('priceChange');
                    $priceChangePercent = (float) $tickerResp->json('priceChangePercent');
                }
            } catch (\Exception $e) { }

            // 3. Calculate RSI(14)
            try {
                $klinesResp = Http::get("{$baseUrl}/api/v1/klines", [
                    'symbol' => 'WLDUSDT',
                    'interval' => '15m',
                    'limit' => 15
                ]);
                if ($klinesResp->successful()) {
                    $klines = $klinesResp->json();
                    if (count($klines) === 15) {
                        $closes = array_map(fn($k) => (float)$k[4], $klines);
                        $rsi = $this->calculateRSI($closes, 14);
                    }
                }
            } catch (\Exception $e) {}

            // 4. Fetch Trade History (DynamoDB with Binance API Fallback)
            $tableName = env('DYNAMODB_TABLE');
            $fetchedFromDynamo = false;

            if ($tableName) {
                try {
                    $client = new DynamoDbClient([
                        'region'  => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
                        'version' => 'latest'
                    ]);

                    $scanResult = $client->scan([
                        'TableName' => $tableName,
                        'Limit' => 15
                    ]);

                    $items = $scanResult->get('Items') ?? [];
                    
                    // Sort descending by timestamp
                    usort($items, function($a, $b) {
                        $timeA = (int)($a['timestamp']['N'] ?? 0);
                        $timeB = (int)($b['timestamp']['N'] ?? 0);
                        return $timeB <=> $timeA;
                    });

                    foreach ($items as $item) {
                        $qty = (float)($item['quantity']['N'] ?? $item['quantity']['S'] ?? 0);
                        $prc = (float)($item['price']['N'] ?? $item['price']['S'] ?? 0);
                        $trades[] = [
                            'time' => isset($item['timestamp']['N']) ? date('M d, H:i:s', (int)$item['timestamp']['N']) : '-',
                            'action' => $item['action']['S'] ?? 'UNKNOWN',
                            'qty' => $qty,
                            'price' => $prc,
                            'value' => $qty * $prc
                        ];
                    }
                    $fetchedFromDynamo = true;
                } catch (\Exception $e) {
                    // Fallback to Binance API if DynamoDB fails
                }
            }

            if (!$fetchedFromDynamo) {
                try {
                    $queryStringTrades = "symbol=WLDUSDT&timestamp={$timestamp}";
                    $signatureTrades = hash_hmac('sha256', $queryStringTrades, $apiSecret);

                    $tradesResp = Http::withHeaders([
                        'X-MBX-APIKEY' => $apiKey
                    ])->get("{$baseUrl}/api/v1/userTrades", [
                        'symbol' => 'WLDUSDT',
                        'timestamp' => $timestamp,
                        'signature' => $signatureTrades
                    ]);

                    if ($tradesResp->successful()) {
                        $items = $tradesResp->json();
                        usort($items, function($a, $b) {
                            return $b['time'] <=> $a['time'];
                        });
                        $items = array_slice($items, 0, 15);

                        foreach ($items as $item) {
                            $qty = (float)$item['qty'];
                            $prc = (float)$item['price'];
                            $trades[] = [
                                'time' => date('M d, H:i:s', (int)($item['time'] / 1000)),
                                'action' => $item['isBuyer'] ? 'BUY' : 'SELL',
                                'qty' => $qty,
                                'price' => $prc,
                                'value' => $qty * $prc
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore
                }
            }
        }

        // Calculate total portfolio value roughly
        $totalUsdtValue = 0;
        foreach ($balances as &$b) {
            $amt = (float)$b['free'] + (float)$b['locked'];
            if ($b['asset'] === 'USDT') {
                $b['usdtValue'] = $amt;
            } elseif ($b['asset'] === 'WLD') {
                $b['usdtValue'] = $amt * $wldPrice;
            } else {
                $b['usdtValue'] = 0; // Other coins not tracked
            }
            $totalUsdtValue += $b['usdtValue'];
        }

        return view('welcome', compact(
            'balances', 'wldPrice', 'priceChange24h', 'priceChangePercent',
            'rsi', 'trades', 'totalUsdtValue', 'error'
        ));
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
