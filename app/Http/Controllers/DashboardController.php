<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    private $baseUrl = 'https://api.binance.th';

    public function index()
    {
        $apiKey = env('BINANCE_API_KEY');
        $apiSecret = env('BINANCE_API_SECRET');
        $error = null;
        $balances = [];
        $wldPrice = 0;

        if (!$apiKey || !$apiSecret) {
            $error = 'API Keys missing. Please configure BINANCE_API_KEY and BINANCE_API_SECRET in environment.';
        } else {
            // 1. Fetch Balances
            try {
                $timestamp = (int) (microtime(true) * 1000);
                $queryString = "timestamp={$timestamp}";
                $signature = hash_hmac('sha256', $queryString, $apiSecret);

                $response = Http::withHeaders([
                    'X-MBX-APIKEY' => $apiKey
                ])->get("{$this->baseUrl}/api/v3/account", [
                    'timestamp' => $timestamp,
                    'signature' => $signature
                ]);

                if ($response->successful()) {
                    $accountData = $response->json();
                    // Filter non-zero balances
                    foreach ($accountData['balances'] as $asset) {
                        if ((float)$asset['free'] > 0 || (float)$asset['locked'] > 0) {
                            $balances[] = $asset;
                        }
                    }
                } else {
                    $error = 'Failed to fetch account info: ' . $response->body();
                }
            } catch (\Exception $e) {
                $error = 'Exception: ' . $e->getMessage();
            }

            // 2. Fetch WLDUSDT Price
            try {
                $priceResp = Http::get("{$this->baseUrl}/api/v3/ticker/price", [
                    'symbol' => 'WLDUSDT'
                ]);
                if ($priceResp->successful()) {
                    $wldPrice = $priceResp->json('price');
                }
            } catch (\Exception $e) {
                // Ignore price error silently for dashboard
            }
        }

        return view('welcome', compact('balances', 'wldPrice', 'error'));
    }
}
