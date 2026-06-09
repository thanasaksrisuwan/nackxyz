import { NextRequest, NextResponse } from "next/server";
import {
  getBotConfig,
  getBotState,
  BotConfigData,
  BotStateData,
} from "@/lib/botConfig";
import {
  fetchAccountBalances,
  fetchBinanceClosingPrices,
  getLastBuyPrice,
  calculateRSI,
  calculateEMA,
  executeLiveTrade,
  logTradeToDynamoDB,
  sendTelegramAlert,
  updateRiskCircuitState,
} from "@/lib/trading";

// Decimal precision map per asset (matching step size on Binance TH)
const PRECISION_MAP: Record<string, number> = {
  BTC: 5, // 0.00001
  ETH: 4, // 0.0001
  BNB: 3, // 0.001
  SOL: 2, // 0.01
  ADA: 1, // 0.1
  XRP: 1,
  DOT: 2,
  WLD: 1,
};

function calcQuantity(baseAsset: string, balance?: number, budgetUsdt?: number, price?: number): number {
  const decimals = PRECISION_MAP[baseAsset] ?? 2;
  const multiplier = Math.pow(10, decimals);

  if (budgetUsdt !== undefined && price !== undefined && price > 0) {
    // BUY: how many units can we buy for budgetUsdt?
    return Math.floor((budgetUsdt / price) * multiplier) / multiplier;
  }

  if (balance !== undefined) {
    // SELL: floor the entire balance to the correct precision
    return Math.floor(balance * multiplier) / multiplier;
  }

  return 0.0;
}

function calculatePortfolioEquity(balances: Record<string, number>, baseAsset: string, currentPrice: number): number {
  const usdtBalance = balances["USDT"] || 0.0;
  const baseBalance = balances[baseAsset] || 0.0;
  return Number((usdtBalance + baseBalance * currentPrice).toFixed(8));
}

export async function GET(request: NextRequest) {
  return handleTradeRequest(request);
}

export async function POST(request: NextRequest) {
  return handleTradeRequest(request);
}

async function handleTradeRequest(request: NextRequest) {
  // 1. Authorize Request
  const authHeader = request.headers.get("Authorization");
  const tokenParam = request.nextUrl.searchParams.get("token");
  
  const expectedToken = process.env.MCP_TOKEN || "mcp-secret-lab-token";
  const providedToken = tokenParam || (authHeader ? authHeader.replace("Bearer ", "") : "");

  if (providedToken !== expectedToken) {
    console.warn("TradeBot: Unauthorized execution attempt.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("TradeBot: Starting RSI trading cycle...");

  try {
    // 2. Load configurations
    const config = await getBotConfig();
    const targetBudgetUsdt = config.trade_amount_usdt ?? 15.0;
    const rsiBuy = config.rsi_buy ?? 30;
    const rsiSell = config.rsi_sell ?? 70;
    const useEmaFilter = config.use_ema_filter ?? true;
    const symbol = (config.symbol || "WLDUSDT").toUpperCase().trim();
    const interval = (config.timeframe || "15m").toLowerCase().trim();
    const dailyMaxLossUsdt = config.daily_max_loss_usdt ?? 5.0;
    const drawdownLimitPct = config.drawdown_limit_pct ?? 10.0;

    const quoteAsset = "USDT";
    const baseAsset = symbol.replace(quoteAsset, "");

    console.log(`TradeBot: Config loaded — Symbol: ${symbol} | Timeframe: ${interval} | RSI Buy<${rsiBuy} Sell>${rsiSell} | Budget: ${targetBudgetUsdt} USDT | EMA Filter: ${useEmaFilter ? "ON" : "OFF"}`);

    // 3. Fetch historical closing prices (need 300 bars for EMA200)
    let closes: number[];
    try {
      closes = await fetchBinanceClosingPrices(symbol, interval, 300);
    } catch (e: any) {
      console.error("TradeBot: Failed to fetch closing prices:", e.message);
      return NextResponse.json({ error: "Failed to fetch klines from Binance" }, { status: 500 });
    }

    if (closes.length < 200) {
      console.warn("TradeBot: Not enough data to calculate EMA 200 and RSI.");
      return NextResponse.json({ status: "skipped", reason: "Insufficient klines data" });
    }

    const currentPrice = closes[closes.length - 1];

    // 4. Calculate RSI(14) & EMA 200
    const rsi = calculateRSI(closes, 14);
    const rsiFormatted = rsi.toFixed(2);
    const ema200 = calculateEMA(closes, 200);
    const emaFormatted = ema200.toFixed(6);

    console.log(`TradeBot: ${symbol} Price=${currentPrice} | RSI=${rsiFormatted} | EMA200=${emaFormatted}`);

    // 5. Fetch account balances
    const balances = await fetchAccountBalances();
    if (Object.keys(balances).length === 0) {
      console.warn("TradeBot: Account balances unavailable. Skipping cycle.");
      return NextResponse.json({ status: "skipped", reason: "Account balances unavailable" });
    }

    const baseBalance = balances[baseAsset] || 0.0;
    const positionValue = baseBalance * currentPrice;
    const isHoldingPosition = positionValue > 5.0; // position is active if base asset is worth > $5
    const portfolioEquityUsdt = calculatePortfolioEquity(balances, baseAsset, currentPrice);

    console.log(`TradeBot: Holding ${baseBalance} ${baseAsset} (~${positionValue.toFixed(2)} USDT). Equity=${portfolioEquityUsdt} USDT. State: ${isHoldingPosition ? "IN POSITION" : "FLAT"}`);

    // 6. Stop-Loss Guard (cut loss at -5%)
    if (isHoldingPosition) {
      const lastBuyPrice = await getLastBuyPrice(symbol);
      if (lastBuyPrice > 0) {
        const pnlPct = ((currentPrice - lastBuyPrice) / lastBuyPrice) * 100;
        if (pnlPct <= -5.0) {
          console.warn(`TradeBot: STOP-LOSS triggered! PnL=${pnlPct.toFixed(2)}% — forcing SELL.`);
          const quantity = calcQuantity(baseAsset, baseBalance);
          if (quantity > 0) {
            const tradeSuccess = await executeLiveTrade(symbol, "SELL", quantity);
            if (tradeSuccess) {
              await logTradeToDynamoDB(symbol, "STOP_LOSS", currentPrice, quantity);
              await sendTelegramAlert(
                `🛑 <b>STOP-LOSS Hit</b>\n` +
                `<b>Symbol:</b> ${symbol}\n` +
                `<b>PnL:</b> ${pnlPct.toFixed(2)}%\n` +
                `<b>Sold:</b> ${quantity} ${baseAsset} @ ${currentPrice.toFixed(6)}`
              );
              return NextResponse.json({ status: "executed", action: "STOP_LOSS", pnl: pnlPct });
            }
          }
          return NextResponse.json({ status: "skipped", reason: "Stop-loss triggered but execute failed" });
        }
      }
    }

    // 7. Circuit Breakers (stops trading if daily loss or drawdown limit reached)
    const riskState = await updateRiskCircuitState(config, portfolioEquityUsdt);
    console.log(`TradeBot: Risk state DailyLoss=${riskState.daily_loss_usdt} USDT | Drawdown=${riskState.current_drawdown_pct}% | Peak=${riskState.equity_peak_usdt} USDT`);

    if (riskState.is_paused) {
      console.warn(`TradeBot: Circuit breaker active (${riskState.pause_code}): ${riskState.pause_reason}`);
      
      // If we JUST paused, trigger a Telegram notification
      if (riskState.pause_code === "JUST_PAUSED") {
        await sendTelegramAlert(
          `🚨 <b>TradeBot Paused</b>\n` +
          `<b>Reason:</b> ${riskState.pause_reason}\n` +
          `<b>Equity:</b> ${portfolioEquityUsdt.toFixed(4)} USDT\n` +
          `<b>Daily Loss:</b> ${riskState.daily_loss_usdt.toFixed(4)} USDT\n` +
          `<b>Drawdown:</b> ${riskState.current_drawdown_pct.toFixed(2)}%`
        );
      }
      return NextResponse.json({ status: "paused", reason: riskState.pause_reason });
    }

    // 8. Trading Strategy Evaluation
    let action: "HOLD" | "BUY" | "SELL" = "HOLD";

    if (rsi < rsiBuy && !isHoldingPosition) {
      if (!useEmaFilter || currentPrice > ema200) {
        console.log(`TradeBot: BUY signal — RSI ${rsiFormatted} < ${rsiBuy}, trend filter passed.`);
        action = "BUY";
      } else {
        console.log(`TradeBot: RSI oversold but price ${currentPrice} <= EMA200 ${emaFormatted}. HOLD (bearish trend).`);
      }
    } else if (rsi > rsiSell && isHoldingPosition) {
      const averageEntryPrice = await getLastBuyPrice(symbol);
      const minProfitFactor = 1.005; // Require at least 0.5% profit to cover fees

      if (averageEntryPrice > 0 && currentPrice >= averageEntryPrice * minProfitFactor) {
        action = "SELL";
      } else if (averageEntryPrice <= 0) {
        action = "SELL"; // Fallback if no entry record is found
      } else {
        const target = (averageEntryPrice * minProfitFactor).toFixed(6);
        console.log(`TradeBot: RSI overbought but price ${currentPrice} < target ${target}. HOLD.`);
      }
    }

    console.log(`TradeBot: Decision => ${action}`);

    // 9. Execute Trade
    if (action !== "HOLD") {
      let quantity = 0;
      if (action === "BUY") {
        quantity = calcQuantity(baseAsset, undefined, targetBudgetUsdt, currentPrice);
      } else {
        quantity = calcQuantity(baseAsset, baseBalance);
      }

      if (quantity <= 0) {
        console.error("TradeBot: Calculated quantity is 0. Skipping trade.");
        return NextResponse.json({ status: "skipped", reason: "Quantity calculated as zero" });
      }

      const tradeSuccess = await executeLiveTrade(symbol, action, quantity);

      if (tradeSuccess) {
        await logTradeToDynamoDB(symbol, action, currentPrice, quantity);

        const emoji = action === "BUY" ? "🟢" : "🔴";
        const message = 
          `🤖 <b>TradeBot Alert</b>\n` +
          `${emoji} <b>${action}</b> executed\n` +
          `<b>Symbol:</b> ${symbol}\n` +
          `<b>Price:</b> ${currentPrice.toFixed(6)} ${quoteAsset}\n` +
          `<b>Qty:</b> ${quantity} ${baseAsset}\n` +
          `<b>RSI(14):</b> ${rsiFormatted}\n` +
          `<b>EMA200:</b> ${emaFormatted}`;
        await sendTelegramAlert(message);
        
        return NextResponse.json({ status: "executed", action, price: currentPrice, quantity });
      } else {
        console.error("TradeBot: Execution failed on Binance exchange");
        return NextResponse.json({ error: "Order execution failed on Binance" }, { status: 502 });
      }
    }

    return NextResponse.json({ status: "completed", action: "HOLD", price: currentPrice, rsi: Number(rsiFormatted) });
  } catch (error: any) {
    console.error("TradeBot Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
