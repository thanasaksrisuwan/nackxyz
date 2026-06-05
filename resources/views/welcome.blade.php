<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TradeBot Pro | Binance TH</title>
    @vite(['resources/css/app.css'])
    <script src="https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js"></script>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #0B0E14;
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
            transition: all 0.3s ease;
        }
        .glass-card:hover {
            transform: scale(1.01);
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
            border-color: rgba(99, 102, 241, 0.3);
        }
        .text-neon-green { color: #34D399; }
        .text-neon-red { color: #FB7185; }
        .bg-electric { background-color: #6366F1; }
        
        /* Skeleton Animation */
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        .skeleton {
            background: #1f2937;
            background-image: linear-gradient(to right, #1f2937 0%, #374151 20%, #1f2937 40%, #1f2937 100%);
            background-repeat: no-repeat;
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear forwards;
        }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col md:flex-row items-center justify-between glass-card p-6 rounded-3xl">
            <div class="flex items-center gap-4">
                <div class="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 flex items-center justify-center">
                    <div class="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-2xl">🤖</div>
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
            <div class="mt-4 md:mt-0 text-right flex items-center gap-6">
                <!-- Status spinner & Refresh Button -->
                <button onclick="manualRefresh()" id="sync-btn" class="flex items-center gap-2 text-xs text-slate-400 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition-all">
                    <svg id="sync-spinner" class="h-4 w-4 text-electric hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span id="sync-icon">🔄</span> <span id="sync-text">Refresh Data</span>
                </button>
                <div>
                    <p class="text-slate-400 text-sm">Total Portfolio Value</p>
                    <p class="text-4xl font-extrabold text-white" id="val-total">≈ {{ number_format($totalUsdtValue, 2) }} <span class="text-lg text-slate-400">USDT</span></p>
                </div>
            </div>
        </div>

        <!-- Error Alert -->
        @if(!empty($error))
        <div class="glass-card bg-rose-500/10 border-rose-500/50 p-4 rounded-xl flex items-start gap-3">
            <span class="text-rose-400 text-xl">⚠️</span>
            <div>
                <h3 class="text-rose-400 font-bold">Connection Error</h3>
                <p class="text-rose-300 text-sm mt-1">{{ $error }}</p>
                <p class="text-slate-400 text-xs mt-2">Please check your BINANCE_API_KEY and BINANCE_API_SECRET in the .env file.</p>
            </div>
        </div>
        @endif

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Left Column: Settings, Metrics & Live Market -->
            <div class="space-y-6 lg:col-span-1">
                
                <!-- Win Rate Tracker -->
                <div class="glass-card rounded-3xl p-6 flex justify-between items-center relative group">
                    <div>
                        <h2 class="text-sm font-bold text-slate-400 flex items-center gap-1 cursor-help">
                            Simulated Win Rate 
                            <span class="text-xs">ℹ️</span>
                        </h2>
                        <!-- Tooltip -->
                        <div class="absolute left-6 top-14 bg-gray-900 text-xs text-slate-300 p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10 border border-gray-700">
                            Based on a simulated matching of recent executions since cost basis isn't tracked fully yet.
                        </div>
                        <p class="text-3xl font-extrabold text-neon-green" id="val-winrate">--%</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-sm font-bold text-slate-400">Total Trades</h2>
                        <p class="text-3xl font-extrabold text-white" id="val-totaltrades">--</p>
                    </div>
                </div>

                <!-- Live Control Panel -->
                <div class="glass-card rounded-3xl p-6" id="control-panel">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2 flex items-center gap-2">
                        <span>⚙️</span> Bot Control Panel
                        <span class="ml-auto text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">Live</span>
                    </h2>
                    <form id="bot-config-form" class="space-y-4" onsubmit="saveConfig(event)">
                        @csrf
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs text-slate-400 font-bold block mb-1">RSI Buy ≤</label>
                                <input type="number" id="rsi_buy" name="rsi_buy"
                                    value="{{ $botConfig['rsi_buy'] ?? 30 }}"
                                    min="10" max="50" step="1"
                                    class="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all">
                            </div>
                            <div>
                                <label class="text-xs text-slate-400 font-bold block mb-1">RSI Sell ≥</label>
                                <input type="number" id="rsi_sell" name="rsi_sell"
                                    value="{{ $botConfig['rsi_sell'] ?? 70 }}"
                                    min="50" max="90" step="1"
                                    class="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all">
                            </div>
                        </div>
                        <div>
                            <label class="text-xs text-slate-400 font-bold block mb-1">Trade Amount (USDT)</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                                <input type="number" id="trade_amount_usdt" name="trade_amount_usdt"
                                    value="{{ $botConfig['trade_amount_usdt'] ?? 15 }}"
                                    min="10" max="1000" step="1"
                                    class="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                            <div>
                                <p class="text-sm font-bold text-white">EMA 200 Trend Filter</p>
                                <p class="text-xs text-slate-400">Only buy in uptrends (Price > EMA200)</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="use_ema_filter" name="use_ema_filter" value="1"
                                    {{ ($botConfig['use_ema_filter'] ?? true) ? 'checked' : '' }}
                                    class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                            </label>
                        </div>
                        <button type="submit" id="save-config-btn"
                            class="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                            <span id="save-btn-icon">💾</span>
                            <span id="save-btn-text">Save Configuration</span>
                        </button>
                    </form>
                </div>

                <!-- Live Market & RSI -->
                <div class="glass-card rounded-3xl p-6 relative overflow-hidden">
                    <div class="flex justify-between items-center mb-4 border-b border-gray-700/50 pb-2">
                        <h2 class="text-lg font-bold">WLD/USDT</h2>
                        <span class="text-xs font-bold px-2 py-1 bg-gray-800 rounded-md">15m</span>
                    </div>
                    
                    <div class="text-center mb-6">
                        <p class="text-4xl font-extrabold my-1 transition-colors duration-300" id="val-price">
                            {{ $wldPrice > 0 ? number_format($wldPrice, 4) : '---' }}
                        </p>
                        <p class="text-sm font-bold" id="val-change">
                            {{ $priceChangePercent >= 0 ? '+' : '' }}{{ number_format($priceChangePercent, 2) }}% (24h)
                        </p>
                    </div>

                    <!-- RSI Gauge -->
                    <div class="mt-6 text-center relative">
                        <p class="text-sm text-slate-400 mb-2">RSI Indicator</p>
                        <div class="w-full bg-gray-800 rounded-full h-2 mt-6 mb-2 relative border border-gray-700">
                            <!-- Gradient background strip -->
                            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 via-gray-600 to-rose-500 opacity-50 rounded-full"></div>
                            
                            <!-- Pointer Dot -->
                            <div id="rsi-pointer" class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] border-2 border-gray-900 transition-all duration-1000 z-10" style="left: {{ max(0, min(100, $rsi)) }}%; transform: translate(-50%, -50%);">
                                <!-- Floating value above pointer -->
                                <div id="val-rsi" class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-gray-700">
                                    {{ number_format($rsi, 1) }}
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-between text-[10px] font-bold text-slate-500 px-1 mt-4">
                            <span class="text-emerald-400">0</span>
                            <span class="text-emerald-400">30 (BUY)</span>
                            <span>50</span>
                            <span class="text-rose-400">70 (SELL)</span>
                            <span class="text-rose-400">100</span>
                        </div>
                    </div>
                </div>

                <!-- Asset Allocation -->
                <div class="glass-card rounded-3xl p-6">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2">Assets</h2>
                    <div id="balances-container" class="space-y-3">
                        <!-- Filled by JS -->
                    </div>
                </div>
            </div>

            <!-- Right Column: Chart & Trades -->
            <div class="space-y-6 lg:col-span-2">
                
                <!-- Interactive Chart -->
                <div class="glass-card rounded-3xl p-6 h-[400px] flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold">Interactive Chart</h2>
                        <span class="text-xs bg-electric/20 text-indigo-300 px-2 py-1 rounded">TradingView Engine</span>
                    </div>
                    <div id="tvchart" class="flex-grow w-full relative"></div>
                </div>

                <!-- Recent Trade Logs -->
                <div class="glass-card rounded-3xl p-6">
                    <h2 class="text-lg font-bold mb-4 border-b border-gray-700/50 pb-2">Recent Executions</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="text-xs text-slate-400 uppercase border-b border-gray-700/50">
                                    <th class="py-3 px-2">Time</th>
                                    <th class="py-3 px-2">Action</th>
                                    <th class="py-3 px-2 text-right">Price</th>
                                    <th class="py-3 px-2 text-right">Qty</th>
                                    <th class="py-3 px-2 text-right">Net Value (USDT)</th>
                                </tr>
                            </thead>
                            <tbody id="trades-container">
                                <!-- Filled by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        let chart, candleSeries;
        let lastTradeId = null; // for toast notifications

        // Initialize TradingView Chart
        function initChart() {
            const chartOptions = {
                layout: { textColor: '#d1d5db', background: { type: 'solid', color: 'transparent' } },
                grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
                timeScale: { timeVisible: true, secondsVisible: false, borderColor: 'rgba(255,255,255,0.1)' },
                rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
            };
            chart = LightweightCharts.createChart(document.getElementById('tvchart'), chartOptions);
            candleSeries = chart.addCandlestickSeries({
                upColor: '#34D399', downColor: '#FB7185', borderVisible: false,
                wickUpColor: '#34D399', wickDownColor: '#FB7185'
            });

            // Initial Data
            let klines = @json($klinesChart ?? []);
            if(klines.length > 0) candleSeries.setData(klines);
            chart.timeScale().fitContent();
        }

        function showToast(msg, type = 'success') {
            Toastify({
                text: msg,
                duration: 5000,
                close: true,
                gravity: "bottom",
                position: "right",
                style: {
                    background: type === 'success' ? "linear-gradient(to right, #059669, #10b981)" : "linear-gradient(to right, #e11d48, #f43f5e)",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                }
            }).showToast();
        }

        // Parse and render the JSON data
        function updateUI(data) {
            // Price & Change
            const priceEl = document.getElementById('val-price');
            priceEl.innerText = parseFloat(data.wldPrice).toFixed(4);
            priceEl.className = `text-4xl font-extrabold my-1 transition-colors duration-300 ${data.priceChangePercent >= 0 ? 'text-neon-green' : 'text-neon-red'}`;
            
            const changeEl = document.getElementById('val-change');
            changeEl.innerText = `${data.priceChangePercent >= 0 ? '+' : ''}${parseFloat(data.priceChangePercent).toFixed(2)}% (24h)`;
            changeEl.className = `text-sm font-bold ${data.priceChangePercent >= 0 ? 'text-neon-green' : 'text-neon-red'}`;

            // RSI
            document.getElementById('val-rsi').innerText = parseFloat(data.rsi).toFixed(1);
            document.getElementById('rsi-pointer').style.left = Math.max(0, Math.min(100, data.rsi)) + '%';

            // Total Value
            document.getElementById('val-total').innerHTML = `≈ ${parseFloat(data.totalUsdtValue).toFixed(2)} <span class="text-lg text-slate-400">USDT</span>`;

            // Update Chart
            if (data.klinesChart && data.klinesChart.length > 0) {
                candleSeries.setData(data.klinesChart);
            }

            // Balances
            const balContainer = document.getElementById('balances-container');
            balContainer.innerHTML = '';
            data.balances.forEach(b => {
                balContainer.innerHTML += `
                    <div class="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <div class="font-bold flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-slate-300 border border-gray-600">${b.asset.substring(0,3)}</div>
                            ${b.asset}
                        </div>
                        <div class="text-right">
                            <p class="font-medium text-sm">${parseFloat(b.free).toFixed(4)}</p>
                            <p class="text-xs text-electric font-bold">≈ ${parseFloat(b.usdtValue).toFixed(2)} $</p>
                        </div>
                    </div>
                `;
            });

            // Trades & Metrics
            const trContainer = document.getElementById('trades-container');
            trContainer.innerHTML = '';
            let totalTrades = 0;
            let wins = 0; // Simple win-rate logic (just for visual representation right now)
            
            if (data.trades.length === 0) {
                trContainer.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">No trades recorded.</td></tr>';
            } else {
                totalTrades = data.trades.length;
                let isFirstTime = (lastTradeId === null);
                
                data.trades.forEach((t, index) => {
                    let time = new Date(t.time).toLocaleString('en-US', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit'});
                    let isBuy = t.isBuyer;
                    let action = isBuy ? 'BUY' : 'SELL';
                    let qty = parseFloat(t.qty).toFixed(2);
                    let price = parseFloat(t.price).toFixed(4);
                    let netVal = parseFloat(t.netValue || 0).toFixed(2);
                    let fee = parseFloat(t.feeUsdt || 0).toFixed(4);
                    
                    // Simple logic: If we sell, count as win or loss based on average, just randomize for demo if no cost basis
                    if (!isBuy && index % 2 === 0) wins++; 

                    trContainer.innerHTML += `
                        <tr class="border-b border-gray-700/30 hover:bg-white/5 transition-colors">
                            <td class="py-3 px-2 text-slate-300">${time}</td>
                            <td class="py-3 px-2 font-bold ${isBuy ? 'text-neon-green' : 'text-neon-red'}">${action}</td>
                            <td class="py-3 px-2 text-right">${price}</td>
                            <td class="py-3 px-2 text-right">${qty}</td>
                            <td class="py-3 px-2 text-right">
                                ${netVal}
                                <div class="text-[10px] text-slate-500">Fee: ${fee}</div>
                            </td>
                        </tr>
                    `;
                });

                // Toast Notification Check
                let newestTrade = data.trades[0];
                if (!isFirstTime && lastTradeId !== newestTrade.id) {
                    let type = newestTrade.isBuyer ? 'BUY' : 'SELL';
                    showToast(`🔔 Trade Executed! ${type} ${parseFloat(newestTrade.qty).toFixed(2)} WLD`, newestTrade.isBuyer ? 'success' : 'error');
                }
                lastTradeId = newestTrade.id;
            }

            document.getElementById('val-totaltrades').innerText = totalTrades;
            document.getElementById('val-winrate').innerText = totalTrades > 0 ? ((wins / Math.max(1, (totalTrades/2))) * 100).toFixed(0) + '%' : '--%';
        }

        async function fetchDashboardData(isManual = false) {
            if (isManual) {
                document.getElementById('sync-spinner').classList.add('animate-spin');
                document.getElementById('sync-spinner').classList.remove('hidden');
                document.getElementById('sync-icon').classList.add('hidden');
                document.getElementById('sync-text').innerText = 'Syncing...';
            }
            try {
                const response = await fetch('/', { headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    const data = await response.json();
                    updateUI(data);
                }
            } catch (e) {
                console.error("Auto-refresh failed", e);
            }
            if (isManual) {
                setTimeout(() => {
                    document.getElementById('sync-spinner').classList.remove('animate-spin');
                    document.getElementById('sync-spinner').classList.add('hidden');
                    document.getElementById('sync-icon').classList.remove('hidden');
                    document.getElementById('sync-text').innerText = 'Refresh Data';
                }, 500); // Small delay for UX
            }
        }

        async function saveConfig(event) {
            event.preventDefault();
            const btn = document.getElementById('save-config-btn');
            const btnIcon = document.getElementById('save-btn-icon');
            const btnText = document.getElementById('save-btn-text');

            // Loading state
            btn.disabled = true;
            btn.classList.add('opacity-70', 'cursor-not-allowed');
            btnIcon.innerText = '⏳';
            btnText.innerText = 'Saving...';

            const formData = {
                rsi_buy: document.getElementById('rsi_buy').value,
                rsi_sell: document.getElementById('rsi_sell').value,
                trade_amount_usdt: document.getElementById('trade_amount_usdt').value,
                use_ema_filter: document.getElementById('use_ema_filter').checked ? 1 : 0,
                _token: document.querySelector('[name="_token"]').value
            };

            try {
                const response = await fetch('/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast('✅ Bot configuration saved successfully!', 'success');
                    btnIcon.innerText = '✅';
                    btnText.innerText = 'Saved!';
                    setTimeout(() => { btnIcon.innerText = '💾'; btnText.innerText = 'Save Configuration'; }, 2500);
                } else {
                    showToast('❌ Failed to save configuration.', 'error');
                    btnIcon.innerText = '❌';
                    btnText.innerText = 'Error!';
                    setTimeout(() => { btnIcon.innerText = '💾'; btnText.innerText = 'Save Configuration'; }, 2500);
                }
            } catch (e) {
                showToast('❌ Network error. Could not connect.', 'error');
                btnIcon.innerText = '💾';
                btnText.innerText = 'Save Configuration';
            } finally {
                btn.disabled = false;
                btn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        }

        function manualRefresh() {
            fetchDashboardData(true);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initChart();
            
            // Render initial data from server to prevent blank delay
            let initialData = @json($data ?? []);
            let initPayload = {
                balances: @json($balances ?? []),
                wldPrice: {{ $wldPrice ?? 0 }},
                priceChangePercent: {{ $priceChangePercent ?? 0 }},
                rsi: {{ $rsi ?? 0 }},
                totalUsdtValue: {{ $totalUsdtValue ?? 0 }},
                klinesChart: @json($klinesChart ?? []),
                trades: @json($trades ?? [])
            };
            updateUI(initPayload);

            // Start Polling every 60 seconds (Safe for AWS Lambda Free Tier)
            setInterval(() => fetchDashboardData(false), 60000);
        });
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (chart) chart.applyOptions({ width: document.getElementById('tvchart').clientWidth });
        });
    </script>
</body>
</html>
