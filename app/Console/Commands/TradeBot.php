<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TradeBot extends Command
{
    protected $signature = 'trade:run';
    protected $description = 'Binance TH RSI trading bot (DISABLED)';

    public function handle()
    {
        $this->warn('TradeBot is disabled.');
        Log::warning('TradeBot: Execution attempted but bot is disabled.');
        return self::SUCCESS;
    }
}
