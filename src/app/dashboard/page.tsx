import crypto from "crypto";
import { getBotConfig, getBotState } from "@/lib/botConfig";
import { fetchAccountBalances } from "@/lib/trading";
import DashboardPanel from "../components/DashboardPanel";

export const revalidate = 0; // Disable server-side caching for the dashboard

export const metadata = {
  title: "Trading Dashboard - Cloud-Native Portfolio Lab",
  description: "Secure interactive console for monitoring and configuring the Binance TH RSI trading bot.",
};

function calculateRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50.0;

  let gains = 0.0;
  let losses = 0.0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0.0;
    const loss = change < 0 ? Math.abs(change) : 0.0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100.0;

  const rs = avgGain / avgLoss;
  return 100.0 - 100.0 / (1.0 + rs);
}

export default async function DashboardPage() {
  const botConfig = await getBotConfig();
  const botState = await getBotState();

  const activeSymbol = botConfig.symbol || "WLDUSDT";
  const timeframe = botConfig.timeframe || "15m";
  const binanceBaseUrl = process.env.BINANCE_BASE_URL || "https://api.binance.th";
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  let error: string | null = null;
  let balances: { asset: string; amount: number; usdtValue: number }[] = [];
  let wldPrice = 0;
  let priceChangePercent = 0;
  let rsi = 50;
  let klinesChart: any[] = [];
  let trades: any[] = [];

  const baseAsset = activeSymbol.replace("USDT", "");

  if (!apiKey || !apiSecret) {
    error = "API Keys missing. Please configure BINANCE_API_KEY and BINANCE_API_SECRET in environment variables.";
  }

  // 1. Fetch Ticker info (public API, no credentials needed)
  try {
    const response = await fetch(`${binanceBaseUrl}/api/v1/ticker/24hr?symbol=${activeSymbol}`, { cache: "no-store" });
    if (response.ok) {
      const ticker = await response.json();
      wldPrice = parseFloat(ticker.lastPrice || "0");
      priceChangePercent = parseFloat(ticker.priceChangePercent || "0");
    }
  } catch (e: any) {
    console.error("Dashboard: Failed to fetch ticker:", e.message);
  }

  // 2. Fetch Klines & Calculate RSI (public API, no credentials needed)
  try {
    const response = await fetch(`${binanceBaseUrl}/api/v1/klines?symbol=${activeSymbol}&interval=${timeframe}&limit=100`, { cache: "no-store" });
    if (response.ok) {
      const klines = await response.json();
      if (Array.isArray(klines) && klines.length >= 15) {
        const closes = klines.map((k: any) => parseFloat(k[4]));
        rsi = calculateRSI(closes, 14);
        klinesChart = klines.map((k: any) => ({
          time: k[0] / 1000,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
        }));
      }
    }
  } catch (e: any) {
    console.error("Dashboard: Failed to fetch klines:", e.message);
  }

  // If keys are provided, query private endpoints
  if (apiKey && apiSecret) {
    // 3. Fetch Balances
    try {
      const rawBalances = await fetchAccountBalances();
      balances = Object.entries(rawBalances).map(([asset, amount]) => {
        let usdtValue = 0;
        if (asset === "USDT") {
          usdtValue = amount;
        } else if (asset === baseAsset) {
          usdtValue = amount * wldPrice;
        }
        return { asset, amount, usdtValue };
      });
    } catch (e: any) {
      console.error("Dashboard: Failed to fetch balances:", e.message);
    }

    // 4. Fetch Trade History from Binance
    try {
      const timestamp = Date.now();
      const params = {
        symbol: activeSymbol,
        limit: 15,
        recvWindow: 10000,
        timestamp,
      };
      
      const queryString = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join("&");
      
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(queryString)
        .digest("hex");

      const response = await fetch(`${binanceBaseUrl}/api/v1/userTrades?${queryString}&signature=${signature}`, {
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
        cache: "no-store",
      });

      if (response.ok) {
        const rawTrades = await response.json();
        if (Array.isArray(rawTrades)) {
          // Sort newest first
          const sorted = [...rawTrades].sort((a: any, b: any) => b.time - a.time);
          trades = sorted.map((t: any) => {
            const qty = parseFloat(t.qty || "0");
            const prc = parseFloat(t.price || "0");
            const grossValue = qty * prc;
            const commission = parseFloat(t.commission || "0");
            const commissionAsset = t.commissionAsset || "USDT";
            
            let feeInUsdt = 0;
            if (commissionAsset === "USDT") {
              feeInUsdt = commission;
            } else if (commissionAsset === baseAsset) {
              feeInUsdt = commission * prc;
            } else if (commissionAsset === "BNB") {
              feeInUsdt = commission * 600.0; // Rough estimation
            }

            return {
              ...t,
              feeUsdt: feeInUsdt,
              netValue: t.isBuyer === true || t.isBuyer === "true" 
                ? (grossValue + feeInUsdt) 
                : (grossValue - feeInUsdt),
            };
          });
        }
      }
    } catch (e: any) {
      console.error("Dashboard: Failed to fetch trades:", e.message);
    }
  }

  // Calculate total portfolio value
  const totalUsdtValue = balances.reduce((sum, b) => sum + b.usdtValue, 0);

  return (
    <DashboardPanel
      botConfig={botConfig}
      botState={botState}
      balances={balances}
      wldPrice={wldPrice}
      priceChangePercent={priceChangePercent}
      rsi={rsi}
      totalUsdtValue={totalUsdtValue}
      trades={trades}
      klinesChart={klinesChart}
      activeSymbol={activeSymbol}
      timeframe={timeframe}
      error={error}
    />
  );
}
