<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class TradeBotTest extends TestCase
{
    public function test_bot_buys_when_oversold_and_not_holding()
    {
        // Mock Environment
        putenv('BINANCE_API_KEY=testkey');
        putenv('BINANCE_API_SECRET=testsecret');
        
        // Mock Http Responses
        Http::fake([
            // 1. Account balances (WLD = 0)
            '*api/v1/accountV2*' => Http::response([
                'balances' => [
                    ['asset' => 'WLD', 'free' => '0.00', 'locked' => '0.00'],
                    ['asset' => 'USDT', 'free' => '100.00', 'locked' => '0.00'],
                ]
            ], 200),
            
            // 2. Klines (Mock 100 periods to simulate RSI < 30)
            '*api/v1/klines*' => Http::response(
                $this->generateMockKlines(oversold: true)
            , 200),

            // 3. Ticker Price
            '*api/v1/ticker/price*' => Http::response([
                'symbol' => 'WLDUSDT',
                'price' => '2.00'
            ], 200),

            // 4. Order endpoint
            '*api/v1/order*' => Http::response([
                'orderId' => 12345,
                'status' => 'FILLED'
            ], 200),
        ]);

        // Run the command and assert it succeeded
        $this->artisan('trade:run')->assertSuccessful();

        // Assert that a buy order was placed
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/api/v1/order') &&
                   $request['side'] === 'BUY' &&
                   $request['type'] === 'MARKET';
        });
    }

    private function generateMockKlines(bool $oversold)
    {
        $klines = [];
        $price = 10.0;
        for ($i = 0; $i < 100; $i++) {
            if ($oversold) {
                $price -= 0.1; // Consistent drop to create oversold RSI
            } else {
                $price += 0.1; // Consistent rise to create overbought RSI
            }
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
