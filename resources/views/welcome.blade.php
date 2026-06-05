<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
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
        .social-link:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255,255,255,0.2);
        }
    </style>
</head>
<body class="flex items-center justify-center p-4">

    <div class="glass-panel w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center mt-12 transition-all duration-500">
        
        <!-- Avatar -->
        <div class="relative w-32 h-32 rounded-full mb-6 p-1 bg-gradient-to-tr from-blue-500 to-purple-600">
            <img src="https://ui-avatars.com/api/?name=Trader&background=random&size=128" alt="Profile" class="w-full h-full rounded-full border-4 border-[#0f172a] object-cover">
            <!-- Online Indicator -->
            <div class="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#0f172a] rounded-full"></div>
        </div>

        <!-- Info -->
        <h1 class="text-3xl font-extrabold tracking-tight mb-2">My Portfolio</h1>
        <p class="text-slate-400 mb-6 text-sm">Crypto Enthusiast & Algorithmic Trader 🚀</p>

        <!-- Stats Panel -->
        <div class="w-full grid grid-cols-2 gap-4 mb-8">
            <div class="glass-panel rounded-2xl p-4">
                <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Bot Status</p>
                <p class="text-lg font-semibold text-green-400 flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Active
                </p>
            </div>
            <div class="glass-panel rounded-2xl p-4">
                <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Systems</p>
                <p class="text-lg font-semibold">100% Free Tier</p>
            </div>
        </div>

        <!-- Links -->
        <div class="w-full space-y-3">
            <a href="#" class="social-link w-full glass-panel flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 group">
                <div class="flex items-center gap-4">
                    <svg class="w-6 h-6 text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span class="font-medium text-slate-200 group-hover:text-white">GitHub</span>
                </div>
                <svg class="w-5 h-5 text-slate-500 group-hover:text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            
            <a href="#" class="social-link w-full glass-panel flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-300 group">
                <div class="flex items-center gap-4">
                    <svg class="w-6 h-6 text-slate-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    <span class="font-medium text-slate-200 group-hover:text-white">Twitter / X</span>
                </div>
                <svg class="w-5 h-5 text-slate-500 group-hover:text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
        </div>

    </div>

</body>
</html>
