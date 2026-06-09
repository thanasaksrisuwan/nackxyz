import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, TABLE_NAME } from "./dynamodb";

export interface BotConfigData {
  rsi_buy: number;
  rsi_sell: number;
  trade_amount_usdt: number;
  use_ema_filter: boolean;
  symbol: string;
  timeframe: string;
  available_symbols: string[];
  daily_max_loss_usdt: number;
  drawdown_limit_pct: number;
}

export interface BotStateData {
  is_paused: boolean;
  pause_code: string;
  pause_reason: string;
  daily_loss_usdt: number;
  daily_start_equity_usdt: number;
  daily_loss_date: string;
  equity_peak_usdt: number;
  current_drawdown_pct: number;
  last_equity_usdt: number;
  updated_at: string;
}

export function getDefaults(): BotConfigData {
  return {
    rsi_buy: 30,
    rsi_sell: 70,
    trade_amount_usdt: 15.0,
    use_ema_filter: true,
    symbol: "WLDUSDT",
    timeframe: "15m",
    available_symbols: ["WLDUSDT", "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT", "XRPUSDT", "DOTUSDT"],
    daily_max_loss_usdt: 5.0,
    drawdown_limit_pct: 10.0,
  };
}

export function getDefaultState(): BotStateData {
  const today = new Date().toISOString().split("T")[0];
  return {
    is_paused: false,
    pause_code: "",
    pause_reason: "",
    daily_loss_usdt: 0.0,
    daily_start_equity_usdt: 0.0,
    daily_loss_date: today,
    equity_peak_usdt: 0.0,
    current_drawdown_pct: 0.0,
    last_equity_usdt: 0.0,
    updated_at: "",
  };
}

export async function getBotConfig(): Promise<BotConfigData> {
  if (!TABLE_NAME) return getDefaults();
  try {
    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: "bot_config" },
      })
    );

    if (result.Item && result.Item.config_json) {
      const parsed = JSON.parse(result.Item.config_json);
      return { ...getDefaults(), ...parsed };
    }
  } catch (error) {
    console.error("BotConfig get error:", error);
  }
  return getDefaults();
}

export async function setBotConfig(config: Partial<BotConfigData>): Promise<boolean> {
  if (!TABLE_NAME) return false;
  try {
    const current = await getBotConfig();
    const merged = { ...current, ...config };
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: "bot_config",
          config_json: JSON.stringify(merged),
        },
      })
    );
    return true;
  } catch (error) {
    console.error("BotConfig set error:", error);
    return false;
  }
}

export async function getBotState(): Promise<BotStateData> {
  if (!TABLE_NAME) return getDefaultState();
  try {
    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: "bot_state" },
      })
    );

    if (result.Item) {
      const item = result.Item;
      return {
        is_paused: item.is_paused === "true" || item.is_paused === true,
        pause_code: item.pause_code || "",
        pause_reason: item.pause_reason || "",
        daily_loss_usdt: Number(item.daily_loss_usdt ?? 0),
        daily_start_equity_usdt: Number(item.daily_start_equity_usdt ?? 0),
        daily_loss_date: item.daily_loss_date || new Date().toISOString().split("T")[0],
        equity_peak_usdt: Number(item.equity_peak_usdt ?? 0),
        current_drawdown_pct: Number(item.current_drawdown_pct ?? 0),
        last_equity_usdt: Number(item.last_equity_usdt ?? 0),
        updated_at: item.updated_at || "",
      };
    }
  } catch (error) {
    console.error("BotConfig getState error:", error);
  }
  return getDefaultState();
}

export async function setBotState(state: Partial<BotStateData>): Promise<boolean> {
  if (!TABLE_NAME) return false;
  try {
    const current = await getBotState();
    const merged = { ...current, ...state };
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id: "bot_state",
          is_paused: merged.is_paused ? "true" : "false",
          pause_code: merged.pause_code,
          pause_reason: merged.pause_reason,
          daily_loss_usdt: Number(merged.daily_loss_usdt),
          daily_start_equity_usdt: Number(merged.daily_start_equity_usdt),
          daily_loss_date: merged.daily_loss_date,
          equity_peak_usdt: Number(merged.equity_peak_usdt),
          current_drawdown_pct: Number(merged.current_drawdown_pct),
          last_equity_usdt: Number(merged.last_equity_usdt),
          updated_at: merged.updated_at || new Date().toISOString(),
        },
      })
    );
    return true;
  } catch (error) {
    console.error("BotConfig setState error:", error);
    return false;
  }
}

export async function resumeBot(): Promise<void> {
  await setBotState({
    is_paused: false,
    pause_code: "",
    pause_reason: "",
  });
}
