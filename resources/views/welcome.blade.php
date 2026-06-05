<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Binance TH Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #0f172a;
            background-image: 
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                radial-gradient(at 50% 0%, hsla(225,39%,30%,0.3) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(339,49%,30%,0.3) 0, transparent 50%);
            color: white;
            min-height: 100vh;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="flex items-center justify-center p-4">

    <div class="glass-panel w-full max-w-2xl rounded-3xl p-8 flex flex-col items-center text-center mt-12 transition-all duration-500">
        
        <!-- Header -->
        <div class="relative w-24 h-24 rounded-full mb-4 p-1 bg-gradient-to-tr from-yellow-400 to-yellow-600">
            <div class="w-full h-full rounded-full border-4 border-[#0f172a] bg-gray-900 flex items-center justify-center">
                <span class="text-3xl">🔶</span>
            </div>
            <!-- Online Indicator -->
            <div class="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-[#0f172a] rounded-full"></div>
        </div>

        <h1 class="text-3xl font-extrabold tracking-tight mb-1">Binance TH Secure Dashboard</h1>
        <p class="text-slate-400 mb-8 text-sm">Authenticated Access Only 🔒</p>

        @if($error)
            <div class="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl w-full mb-6 text-left">
                <strong>Error:</strong> {{ $error }}
            </div>
        @endif

        <!-- Real-Time Market Info -->
        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="glass-panel rounded-2xl p-6 text-left">
                <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Trading Pair</p>
                <p class="text-2xl font-bold text-white">WLD / USDT</p>
            </div>
            <div class="glass-panel rounded-2xl p-6 text-left">
                <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Price</p>
                <p class="text-2xl font-bold text-green-400">
                    {{ $wldPrice ? number_format($wldPrice, 4) . ' USDT' : 'Loading...' }}
                </p>
            </div>
        </div>

        <!-- Portfolio Balances -->
        <div class="w-full">
            <h2 class="text-xl font-bold mb-4 text-left border-b border-slate-700 pb-2">Your Balances</h2>
            
            @if(empty($balances))
                <p class="text-slate-400 py-4">No balances found or API connection failed.</p>
            @else
                <div class="space-y-3">
                    @foreach($balances as $asset)
                        <div class="glass-panel flex items-center justify-between px-6 py-4 rounded-xl">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                    {{ substr($asset['asset'], 0, 3) }}
                                </div>
                                <span class="font-bold text-lg text-white">{{ $asset['asset'] }}</span>
                            </div>
                            <div class="text-right">
                                <p class="text-white font-semibold">{{ number_format($asset['free'], 6) }}</p>
                                @if((float)$asset['locked'] > 0)
                                    <p class="text-xs text-slate-400">Locked: {{ $asset['locked'] }}</p>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

    </div>

</body>
</html>
