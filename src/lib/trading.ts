import crypto from "crypto";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, TABLE_NAME } from "./dynamodb";
import { getBotState, setBotState, BotConfigData, BotStateData } from "./botConfig";

// Base URLs
const getBaseUrl = () => process.env.BINANCE_BASE_URL || "https://api.binance.th";

// Helper for HTTP requests
async function binanceGet(path: string, params: Record<string, any> = {}, secured = false): Promise<any> {
  const baseUrl = getBaseUrl();
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  let url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {};

  if (secured) {
    if (!apiKey || !apiSecret) {
      throw new Error("Missing Binance API Key or Secret");
    }
    headers["X-MBX-APIKEY"] = apiKey;
    
    // Add timestamp and recvWindow
    const timestamp = Date.now();
    const queryParams = {
      ...params,
      recvWindow: 10000,
      timestamp,
    };
    
    // Serialize query params alphabetically or in exact order for signing
    const queryString = Object.entries(queryParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(queryString)
      .digest("hex");
    
    url = `${url}?${queryString}&signature=${signature}`;
  } else if (Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    url = `${url}?${queryString}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Binance GET failed: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

async function binancePost(path: string, params: Record<string, any> = {}): Promise<any> {
  const baseUrl = getBaseUrl();
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Missing Binance API Key or Secret");
  }

  const timestamp = Date.now();
  const bodyParams = {
    ...params,
    recvWindow: 10000,
    timestamp,
  };

  const queryString = Object.entries(bodyParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(queryString)
    .digest("hex");

  const url = `${baseUrl}${path}?${queryString}&signature=${signature}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-MBX-APIKEY": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Binance POST failed: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

// 1. Fetch Balances
export async function fetchAccountBalances(): Promise<Record<string, number>> {
  try {
    const data = await binanceGet("/api/v1/accountV2", {}, true);
    const balances: Record<string, number> = {};
    if (data && Array.isArray(data.balances)) {
      for (const asset of data.balances) {
        const amt = parseFloat(asset.free || "0") + parseFloat(asset.locked || "0");
        if (amt > 0) {
          balances[asset.asset] = amt;
        }
      }
    }
    return balances;
  } catch (error) {
    console.error("fetchAccountBalances error:", error);
    return {};
  }
}

// 2. Fetch Closing Prices
export async function fetchBinanceClosingPrices(symbol: string, interval: string, limit: number): Promise<number[]> {
  const data = await binanceGet("/api/v1/klines", { symbol, interval, limit });
  if (Array.isArray(data)) {
    return data.map((kline: any) => parseFloat(kline[4])); // Index 4 is Close price
  }
  throw new Error("Invalid klines format returned");
}

// 3. Get Last Buy Price
export async function getLastBuyPrice(symbol: string): Promise<number> {
  try {
    const trades = await binanceGet("/api/v1/userTrades", { symbol, limit: 50 }, true);
    if (Array.isArray(trades)) {
      // Sort descending by time
      const sorted = [...trades].sort((a: any, b: any) => b.time - a.time);
      for (const trade of sorted) {
        if (trade.isBuyer === true || trade.isBuyer === "true") {
          return parseFloat(trade.price);
        }
      }
    }
  } catch (error) {
    console.error("getLastBuyPrice error:", error);
  }
  return 0.0;
}

// 4. Calculate RSI(14)
export function calculateRSI(closes: number[], period = 14): number {
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

// 5. Calculate EMA
export function calculateEMA(closes: number[], period = 200): number {
  if (closes.length < period) return closes[closes.length - 1];

  const multiplier = 2 / (period + 1);
  const sma = closes.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  let ema = sma;

  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
  }

  return ema;
}

// 6. Execute Live Trade
export async function executeLiveTrade(symbol: string, side: "BUY" | "SELL", quantity: number): Promise<boolean> {
  try {
    const data = await binancePost("/api/v1/order", {
      symbol,
      side,
      type: "MARKET",
      quantity,
    });
    return !!data.orderId;
  } catch (error) {
    console.error("executeLiveTrade failed:", error);
    return false;
  }
}

// 7. Log Trade to DynamoDB
export async function logTradeToDynamoDB(symbol: string, action: string, price: number, quantity: number): Promise<void> {
  if (!TABLE_NAME) return;
  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          symbol,
          action,
          price: Number(price),
          quantity: Number(quantity),
          timestamp: Math.floor(Date.now() / 1000),
        },
      })
    );
  } catch (error) {
    console.error("Failed to log trade to DynamoDB:", error);
  }
}

// 8. Send Telegram Alert
export async function sendTelegramAlert(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram alert:", error);
  }
}

// 9. Update Risk Circuit State
export async function updateRiskCircuitState(config: BotConfigData, currentEquityUsdt: number): Promise<BotStateData> {
  const state = await getBotState();
  const today = new Date().toISOString().split("T")[0];

  const dailyMaxLossUsdt = Math.max(0.0, config.daily_max_loss_usdt || 0.0);
  const drawdownLimitPct = Math.max(0.0, config.drawdown_limit_pct || 0.0);

  let previousPaused = state.is_paused;
  let previousCode = state.pause_code;
  const isNewDay = state.daily_loss_date !== today;

  if (isNewDay) {
    state.daily_loss_date = today;
    state.daily_start_equity_usdt = currentEquityUsdt;
    state.daily_loss_usdt = 0.0;

    if (previousCode === "DAILY_MAX_LOSS") {
      previousPaused = false;
      previousCode = "";
    }
  }

  if (state.daily_start_equity_usdt <= 0 && currentEquityUsdt > 0) {
    state.daily_start_equity_usdt = currentEquityUsdt;
  }

  const dailyStartEquity = state.daily_start_equity_usdt;
  const dailyLossUsdt = Math.max(0.0, dailyStartEquity - currentEquityUsdt);

  let equityPeakUsdt = state.equity_peak_usdt;
  if (currentEquityUsdt > equityPeakUsdt) {
    equityPeakUsdt = currentEquityUsdt;
  }
  if (equityPeakUsdt <= 0 && currentEquityUsdt > 0) {
    equityPeakUsdt = currentEquityUsdt;
  }

  const currentDrawdownPct = equityPeakUsdt > 0
    ? Math.max(0.0, ((equityPeakUsdt - currentEquityUsdt) / equityPeakUsdt) * 100)
    : 0.0;

  let pauseCode = "";
  let pauseReason = "";

  if (previousPaused && previousCode === "DAILY_MAX_LOSS" && !isNewDay) {
    pauseCode = "DAILY_MAX_LOSS";
    pauseReason = state.pause_reason || "Daily max loss reached. Bot paused until next trading day.";
  } else if (dailyMaxLossUsdt > 0 && dailyLossUsdt >= dailyMaxLossUsdt) {
    pauseCode = "DAILY_MAX_LOSS";
    pauseReason = `Daily loss ${dailyLossUsdt.toFixed(4)} USDT reached limit ${dailyMaxLossUsdt.toFixed(4)} USDT.`;
  } else if (drawdownLimitPct > 0 && currentDrawdownPct >= drawdownLimitPct) {
    pauseCode = "DRAWDOWN_LIMIT";
    pauseReason = `Drawdown ${currentDrawdownPct.toFixed(2)}% reached limit ${drawdownLimitPct.toFixed(2)}%.`;
  }

  const isPaused = pauseCode !== "";
  
  const updatedState: Partial<BotStateData> = {
    is_paused: isPaused,
    pause_code: pauseCode,
    pause_reason: pauseReason,
    daily_loss_usdt: Number(dailyLossUsdt.toFixed(4)),
    daily_start_equity_usdt: Number(dailyStartEquity.toFixed(4)),
    daily_loss_date: state.daily_loss_date,
    equity_peak_usdt: Number(equityPeakUsdt.toFixed(4)),
    current_drawdown_pct: Number(currentDrawdownPct.toFixed(4)),
    last_equity_usdt: Number(currentEquityUsdt.toFixed(4)),
    updated_at: new Date().toISOString(),
  };

  // Add virtual field to check if we just paused
  const justPaused = isPaused && (!previousPaused || previousCode !== pauseCode);
  
  await setBotState(updatedState);

  return {
    ...state,
    ...updatedState,
    // Inject custom virtual property for triggering alerts
    pause_code: justPaused ? "JUST_PAUSED" : updatedState.pause_code || "",
  } as any;
}

// 10. Fetch Local DynamoDB Trades (for audit / history fallback)
export async function fetchLocalTrades(): Promise<any[]> {
  if (!TABLE_NAME) return [];
  try {
    const response = await ddbDocClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(id, :prefix)",
        ExpressionAttributeValues: {
          ":prefix": "trade_",
        },
      })
    );
    const items = response.Items || [];
    return items.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("fetchLocalTrades error:", error);
    return [];
  }
}
