<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_dashboard_renders_with_mocked_binance_data()
    {
        // Set environment variables for the test
        putenv('BINANCE_API_KEY=testkey');
        putenv('BINANCE_API_SECRET=testsecret');
        
        // Disable Basic Auth for the test to reach the controller
        $this->withoutMiddleware(\App\Http\Middleware\BasicAdminAuth::class);

        // Mock all HTTP calls made by the DashboardController
        Http::fake([
            '*api/v1/accountV2*' => Http::response([
                'balances' => [
                    ['asset' => 'WLD', 'free' => '50.00', 'locked' => '0.00'],
                    ['asset' => 'USDT', 'free' => '100.00', 'locked' => '0.00'],
                ]
            ], 200),
            
            '*api/v1/ticker/24hr*' => Http::response([
                'lastPrice' => '2.50',
                'priceChange' => '0.10',
                'priceChangePercent' => '4.16'
            ], 200),

            '*api/v1/klines*' => Http::response($this->generateMockKlines(), 200),

            '*api/v1/userTrades*' => Http::response([
                [
                    'symbol' => 'WLDUSDT',
                    'id' => 12345,
                    'orderId' => 67890,
                    'price' => '2.40',
                    'qty' => '10.00',
                    'commission' => '0.024',
                    'commissionAsset' => 'USDT',
                    'time' => 1715000000000,
                    'isBuyer' => true
                ]
            ], 200)
        ]);

        // Make the GET request to the dashboard
        $response = $this->get('/');

        // Assert successful response
        $response->assertStatus(200);

        // Assert the view has the correct data injected
        $response->assertViewHas('balances');
        $response->assertViewHas('wldPrice', 2.50);
        $response->assertViewHas('rsi');
        $response->assertViewHas('trades');
        $response->assertViewHas('totalUsdtValue');

        // Assert that the total portfolio value is correctly calculated
        // 100 USDT + (50 WLD * 2.50) = 225 USDT
        $this->assertEquals(225.0, $response->viewData('totalUsdtValue'));
    }

    public function test_save_config_accepts_risk_circuit_breaker_fields()
    {
        putenv('DYNAMODB_TABLE=');

        $this->withoutMiddleware(\App\Http\Middleware\BasicAdminAuth::class);

        $response = $this->postJson('/config', [
            'rsi_buy' => 30,
            'rsi_sell' => 70,
            'trade_amount_usdt' => 15,
            'use_ema_filter' => true,
            'symbol' => 'BTCUSDT',
            'timeframe' => '1h',
            'daily_max_loss_usdt' => 5,
            'drawdown_limit_pct' => 10,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => false]);
    }

    private function generateMockKlines()
    {
        $klines = [];
        $price = 2.0;
        for ($i = 0; $i < 100; $i++) {
            $price += 0.01; // Upward trend
            $klines[] = [
                0, // Open time
                (string)$price, // Open
                (string)$price, // High
                (string)$price, // Low
                (string)$price, // Close (Index 4 is what bot reads)
            ];
        }
        return $klines;
    }
}
