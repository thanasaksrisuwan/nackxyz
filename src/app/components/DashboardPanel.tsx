"use client";

import { useState } from "react";
import Link from "next/link";
import { saveConfigAction, resumeBotAction } from "@/lib/actions";
import { BotConfigData, BotStateData } from "@/lib/botConfig";
import TradingChart from "./TradingChart";

interface DashboardPanelProps {
  botConfig: BotConfigData;
  botState: BotStateData;
  balances: { asset: string; amount: number; usdtValue: number }[];
  wldPrice: number;
  priceChangePercent: number;
  rsi: number;
  totalUsdtValue: number;
  trades: any[];
  klinesChart: any[];
  activeSymbol: string;
  timeframe: string;
  error: string | null;
}

export default function DashboardPanel({
  botConfig,
  botState,
  balances,
  wldPrice,
  priceChangePercent,
  rsi,
  totalUsdtValue,
  trades,
  klinesChart,
  activeSymbol,
  timeframe,
  error,
}: DashboardPanelProps) {
  const [configLoading, setConfigLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; icon: string; msg: string; type: "success" | "error" }>({
    show: false,
    icon: "✓",
    msg: "",
    type: "success",
  });

  const triggerToast = (icon: string, msg: string, type: "success" | "error") => {
    setToast({ show: true, icon, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfigLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await saveConfigAction(formData);
      if (result.success) {
        triggerToast("✓", result.message || "Configuration saved!", "success");
      } else {
        triggerToast("✕", result.message || "Failed to save config.", "error");
      }
    } catch (err) {
      triggerToast("✕", "An unexpected error occurred.", "error");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleResumeBot = async () => {
    setResumeLoading(true);
    try {
      const result = await resumeBotAction();
      if (result.success) {
        triggerToast("✓", result.message || "Bot resumed!", "success");
      } else {
        triggerToast("✕", result.message || "Failed to resume bot.", "error");
      }
    } catch (err) {
      triggerToast("✕", "An error occurred.", "error");
    } finally {
      setResumeLoading(false);
    }
  };

  // Derive WLD (base asset) amount from balances
  const baseAsset = activeSymbol.replace("USDT", "");
  const baseBalanceObj = balances.find((b) => b.asset === baseAsset);
  const baseBalance = baseBalanceObj ? baseBalanceObj.amount : 0.0;
  const positionValue = baseBalance * wldPrice;
  const isHolding = positionValue > 5.0;

  return (
    <>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="grid-overlay"></div>

      <header>
        <div className="nav-container">
          <Link href="/" className="logo">
            PORTFOLIO LAB
          </Link>
          <Link href="/" className="back-btn" style={{ color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to Portfolio
          </Link>
        </div>
      </header>

      <main className="container">
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              fontSize: "0.95rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* 🤖 Bot Status Alert Bar */}
        <div
          className="panel-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
            borderLeft: botState.is_paused ? "4px solid var(--danger)" : "4px solid var(--success)",
            padding: "1.25rem 2rem",
          }}
        >
          <div>
            <div className="status-indicator">
              <span className={`status-dot ${botState.is_paused ? "paused" : "active"}`}></span>
              <span>Trading Bot Status: {botState.is_paused ? "PAUSED" : "ACTIVE"}</span>
            </div>
            {botState.is_paused && (
              <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "#f87171" }}>
                <strong>Reason:</strong> {botState.pause_reason || "Circuit breaker active."} (Code: {botState.pause_code})
              </div>
            )}
          </div>
          {botState.is_paused && (
            <button className="btn-primary" onClick={handleResumeBot} disabled={resumeLoading}>
              {resumeLoading ? "Resuming..." : "Resume Bot Operations"}
            </button>
          )}
        </div>

        {/* 📊 Metrics Grid */}
        <div className="dashboard-grid">
          <div className="metrics-row">
            {/* Price Metric */}
            <div className="metric-card">
              <span className="title">{activeSymbol} Price</span>
              <span className="value">${wldPrice.toFixed(4)}</span>
              <span className={`sub ${priceChangePercent >= 0 ? "text-success" : "text-danger"}`}>
                {priceChangePercent >= 0 ? "+" : ""}
                {priceChangePercent.toFixed(2)}% (24h)
              </span>
            </div>

            {/* RSI Metric */}
            <div className="metric-card">
              <span className="title">Calculated RSI(14)</span>
              <span className="value">{rsi.toFixed(2)}</span>
              <span className="sub" style={{ color: "var(--text-muted)" }}>
                Timeframe: {timeframe}
              </span>
            </div>

            {/* Portfolio Value Metric */}
            <div className="metric-card">
              <span className="title">Portfolio Equity</span>
              <span className="value">${totalUsdtValue.toFixed(2)}</span>
              <span className="sub text-success" style={{ fontWeight: 600 }}>
                Binance.th Wallet
              </span>
            </div>

            {/* Position Metric */}
            <div className="metric-card">
              <span className="title">Active Position</span>
              <span className="value">
                {baseBalance.toFixed(2)} {baseAsset}
              </span>
              <span className={`sub ${isHolding ? "text-success" : "text-muted"}`} style={{ fontWeight: 600 }}>
                {isHolding ? `~${positionValue.toFixed(2)} USDT (Holding)` : "Flat"}
              </span>
            </div>
          </div>
        </div>

        {/* ⚙️ Configuration & 📈 Chart Side-by-Side */}
        <div className="grid-2" style={{ gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
          {/* Configuration Form */}
          <div className="panel-card">
            <h3 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "1.25rem", marginBottom: "1.5rem" }}>
              Bot Parameters
            </h3>
            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label htmlFor="symbol">Symbol</label>
                <select id="symbol" name="symbol" defaultValue={activeSymbol}>
                  {botConfig.available_symbols.map((sym) => (
                    <option key={sym} value={sym}>
                      {sym}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="timeframe">Timeframe</label>
                  <select id="timeframe" name="timeframe" defaultValue={timeframe}>
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="30m">30m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="trade_amount_usdt">Budget (USDT)</label>
                  <input
                    type="number"
                    step="1"
                    id="trade_amount_usdt"
                    name="trade_amount_usdt"
                    required
                    defaultValue={botConfig.trade_amount_usdt}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rsi_buy">RSI BUY Threshold</label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="50"
                    id="rsi_buy"
                    name="rsi_buy"
                    required
                    defaultValue={botConfig.rsi_buy}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rsi_sell">RSI SELL Threshold</label>
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="90"
                    id="rsi_sell"
                    name="rsi_sell"
                    required
                    defaultValue={botConfig.rsi_sell}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="daily_max_loss_usdt">Daily Max Loss ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="daily_max_loss_usdt"
                    name="daily_max_loss_usdt"
                    required
                    defaultValue={botConfig.daily_max_loss_usdt}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="drawdown_limit_pct">Drawdown Limit (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    id="drawdown_limit_pct"
                    name="drawdown_limit_pct"
                    required
                    defaultValue={botConfig.drawdown_limit_pct}
                  />
                </div>
              </div>

              <div className="checkbox-group" style={{ marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  id="use_ema_filter"
                  name="use_ema_filter"
                  defaultChecked={botConfig.use_ema_filter}
                />
                <label htmlFor="use_ema_filter">Filter Trades with EMA200</label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }} disabled={configLoading}>
                {configLoading ? "Saving..." : "Save Bot Config"}
              </button>
            </form>
          </div>

          {/* Interactive Chart */}
          <TradingChart klines={klinesChart} />
        </div>

        {/* 🧾 Recent Executed Trades */}
        <div className="panel-card" style={{ marginTop: "2rem" }}>
          <h3 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "1.25rem", marginBottom: "1rem" }}>
            Recent Binance Executions
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Action</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Net Value</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const formattedTime = new Date(t.time).toLocaleString();
                  const qty = parseFloat(t.qty || "0");
                  const price = parseFloat(t.price || "0");
                  const comm = parseFloat(t.commission || "0");
                  const isBuy = t.isBuyer === true || t.isBuyer === "true";
                  
                  return (
                    <tr key={t.id}>
                      <td>{formattedTime}</td>
                      <td>{t.symbol}</td>
                      <td>
                        <span className={`badge ${isBuy ? "buy" : "sell"}`}>
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                      </td>
                      <td>${price.toFixed(4)}</td>
                      <td>
                        {qty} {baseAsset}
                      </td>
                      <td>${(t.netValue || qty * price).toFixed(4)}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {comm} {t.commissionAsset} (${t.feeUsdt ? t.feeUsdt.toFixed(4) : "0.00"})
                      </td>
                    </tr>
                  );
                })}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                      No trades registered on the exchange for this pair yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? "show" : ""} ${toast.type}`}>
        <span className="toast-icon">{toast.icon}</span>
        <span>{toast.msg}</span>
      </div>
    </>
  );
}
