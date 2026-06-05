<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TradeBot Pro | Binance TH</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #0B0E14; /* Sleek Dark */
            background-image: 
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0, transparent 50%), 
                radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0, transparent 50%),
                radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.1) 0, transparent 50%);
            color: white;
            min-height: 100vh;
        }
        .glass-card {
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .text-neon-green { color: #34D399; } /* Emerald */
        .text-neon-red { color: #FB7185; } /* Rose */
        .bg-electric { background-color: #6366F1; } /* Indigo */
        .border-electric { border-color: #6366F1; }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="max-w-6xl mx-auto space-y-6">

        <!-- Header: Bot Status & Mode -->
        <div class="flex flex-col md:flex-row items-center justify-between glass-card p-6 rounded-3xl">
            <div class="flex items-center gap-4">
                <div class="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 flex items-center justify-center">
                    <div class="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-2xl">🤖</div>
                    <!-- Status Indicator -->
                    <div class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-gray-900 rounded-full animate-pulse"></div>
                </div>
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight">TradeBot Pro</h1>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                        <span class="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Live Trading</span>
                    </div>
                </div>
            </div>
            <div class="mt-4 md:mt-0 text-right">
                <p class="text-slate-400 text-sm">Total Portfolio Value</p>
                <p class="text-4xl font-extrabold text-white">≈ {{ number_format($totalUsdtValue, 2) }} <span class="text-lg text-slate-400">USDT</span></p>
            </div>
        </div>

        @if($error)
            <div class="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-6 py-4 rounded-2xl w-full">
                <strong>System Alert:</strong> {{ $error }}
            </div>
        @endif

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Left Column: Settings & Live Market -->
            <div class="space-y-6 lg:col-span-1">
                
                <!-- Strategy Config -->
                <div class="glass-card rounded-3xl p-6">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2">Bot Strategy</h2>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between"><span class="text-slate-400">Trading Pair</span><span class="font-bold text-white">WLD/USDT</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Base Budget</span><span class="font-bold text-white">15.00 USDT</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Buy Threshold</span><span class="font-bold text-neon-green">RSI < 30</span></div>
                        <div class="flex justify-between"><span class="text-slate-400">Sell Threshold</span><span class="font-bold text-neon-red">RSI > 70</span></div>
                    </div>
                </div>

                <!-- Live Market & RSI -->
                <div class="glass-card rounded-3xl p-6 relative overflow-hidden">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2">Live Market</h2>
                    <div class="text-center mb-6">
                        <p class="text-sm text-slate-400">WLD/USDT Price</p>
                        <p class="text-4xl font-extrabold my-1 {{ $priceChange24h >= 0 ? 'text-neon-green' : 'text-neon-red' }}">
                            {{ $wldPrice > 0 ? number_format($wldPrice, 4) : '---' }}
                        </p>
                        <p class="text-sm {{ $priceChangePercent >= 0 ? 'text-neon-green' : 'text-neon-red' }}">
                            {{ $priceChangePercent >= 0 ? '+' : '' }}{{ number_format($priceChangePercent, 2) }}% (24h)
                        </p>
                    </div>

                    <!-- RSI Gauge -->
                    <div class="mt-6 text-center">
                        <p class="text-sm text-slate-400 mb-2">RSI (14) - 15m</p>
                        <div class="w-full bg-gray-800 rounded-full h-4 mb-2 relative overflow-hidden border border-gray-700">
                            <!-- Gradient background indicating zones -->
                            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 via-gray-600 to-rose-500 opacity-30"></div>
                            <!-- Current RSI Marker -->
                            <div class="absolute top-0 h-full bg-electric rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.8)]" style="width: {{ max(0, min(100, $rsi)) }}%;"></div>
                        </div>
                        <div class="flex justify-between text-xs font-bold text-slate-500 px-1">
                            <span class="text-emerald-400">30 (BUY)</span>
                            <span class="text-white text-lg">{{ number_format($rsi, 1) }}</span>
                            <span class="text-rose-400">70 (SELL)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Balances & Trade Logs -->
            <div class="space-y-6 lg:col-span-2">
                
                <!-- Balances -->
                <div class="glass-card rounded-3xl p-6">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2">Asset Allocation</h2>
                    @if(empty($balances))
                        <p class="text-slate-400 py-4 text-center">No balances available.</p>
                    @else
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="text-xs text-slate-400 uppercase border-b border-gray-700/50">
                                        <th class="py-3 px-2">Asset</th>
                                        <th class="py-3 px-2 text-right">Available</th>
                                        <th class="py-3 px-2 text-right">Locked</th>
                                        <th class="py-3 px-2 text-right">Est. USDT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($balances as $b)
                                    <tr class="border-b border-gray-700/30 hover:bg-white/5 transition-colors">
                                        <td class="py-3 px-2 font-bold flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs border border-gray-600">{{ substr($b['asset'], 0, 3) }}</div>
                                            {{ $b['asset'] }}
                                        </td>
                                        <td class="py-3 px-2 text-right font-medium">{{ rtrim(rtrim(number_format($b['free'], 6), '0'), '.') }}</td>
                                        <td class="py-3 px-2 text-right text-slate-400 text-sm">{{ rtrim(rtrim(number_format($b['locked'], 6), '0'), '.') }}</td>
                                        <td class="py-3 px-2 text-right font-bold text-electric">{{ number_format($b['usdtValue'] ?? 0, 2) }}</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>

                <!-- Recent Trade Logs -->
                <div class="glass-card rounded-3xl p-6">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2">Recent Trade Logs</h2>
                    @if(empty($trades))
                        <p class="text-slate-400 py-8 text-center">No trades recorded on Binance TH yet.</p>
                    @else
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr class="text-xs text-slate-400 uppercase border-b border-gray-700/50">
                                        <th class="py-3 px-2">Date / Time</th>
                                        <th class="py-3 px-2">Action</th>
                                        <th class="py-3 px-2 text-right">Qty</th>
                                        <th class="py-3 px-2 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($trades as $t)
                                        @php
                                            $time = $t['time'];
                                            $action = $t['action'];
                                            $qty = $t['qty'];
                                            $price = $t['price'];
                                            $value = $t['value'];
                                            $isBuy = str_contains(strtoupper($action), 'BUY');
                                        @endphp
                                        <tr class="border-b border-gray-700/30 hover:bg-white/5 transition-colors">
                                            <td class="py-3 px-2 text-slate-300">{{ $time }}</td>
                                            <td class="py-3 px-2 font-bold {{ $isBuy ? 'text-neon-green' : 'text-neon-red' }}">
                                                {{ $action }}
                                            </td>
                                            <td class="py-3 px-2 text-right">{{ rtrim(rtrim(number_format((float)$qty, 4), '0'), '.') }}</td>
                                            <td class="py-3 px-2 text-right">{{ number_format($value, 2) }} <span class="text-xs text-slate-500">USDT</span></td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>

            </div>
        </div>
    </div>
</body>
</html>
