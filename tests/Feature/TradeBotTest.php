<?php

namespace Tests\Feature;

use Tests\TestCase;

class TradeBotTest extends TestCase
{
    public function test_trade_bot_is_disabled()
    {
        $this->artisan('trade:run')
            ->expectsOutput('TradeBot is disabled.')
            ->assertSuccessful();
    }
}
