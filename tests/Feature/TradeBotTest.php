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
        // Unset DynamoDB table so BotConfig returns defaults without AWS SDK call
        putenv('DYNAMODB_TABLE=');
        
        // Mock Http Responses
        Http::fake([
            // 1. Account balances (WLD = 0)
            '*api/v1/accountV2*' => Http::response([
                'balances' => [
                    ['asset' => 'WLD', 'free' => '0.00', 'locked' => '0.00'],
                    ['asset' => 'USDT', 'free' => '100.00', 'locked' => '0.00'],
                ]
            ], 200),
            
            // 2. Klines (Mock 300 periods to simulate RSI < 30 + EMA bullish)
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

    public function test_bot_does_not_trade_when_balances_are_unavailable()
    {
        putenv('BINANCE_API_KEY=testkey');
        putenv('BINANCE_API_SECRET=testsecret');
        putenv('DYNAMODB_TABLE=');

        Http::fake([
            '*api/v1/accountV2*' => Http::response(['code' => -1, 'msg' => 'account unavailable'], 500),
            '*api/v1/klines*' => Http::response($this->generateMockKlines(oversold: true), 200),
            '*api/v1/order*' => Http::response([
                'orderId' => 12345,
                'status' => 'FILLED'
            ], 200),
        ]);

        $this->artisan('trade:run')->assertSuccessful();

        Http::assertNotSent(function ($request) {
            return str_contains($request->url(), '/api/v1/order');
        });
    }

    private function generateMockKlines(bool $oversold)
    {
        $klines = [];
        $price = 10.0;
        for ($i = 0; $i < 300; $i++) {
            if ($oversold) {
                // To trigger BUY: we need RSI < 30 AND Current Price > EMA 200
                if ($i < 280) {
                    $price += 0.05; // Long uptrend to pull EMA 200 up (e.g. from 10 to 24)
                } else {
                    $price -= 0.5; // Sharp sudden drop for last 20 periods to crush RSI < 30 
                }
                // EMA will lag and be around ~18-20. Current price will be around 14. Wait, 14 is NOT > 20!
                // Let's do: EMA starts very low. 
                // Wait, if EMA must be < currentPrice. Let's start price at 10.
                // 0 to 280: price goes from 10 to 12.
                // 280 to 300: price drops sharply from 12 to 11. 
                // EMA200 will be around 11.something. Current price is 11.
                // Wait, easier:
                // Just hardcode the prices or adjust.
                if ($i < 200) {
                    $price = 10.0; // Flat
                } elseif ($i < 286) {
                    $price += 0.5; // Massive pump to 53
                } else {
                    $price -= 1.0; // Drop 14 periods to 39. RSI will be 0. EMA200 will be around 20. 39 > 20! Perfect.
                }
            } else {
                // To trigger SELL: RSI > 70 AND Holding
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
