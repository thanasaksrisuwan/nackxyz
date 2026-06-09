"use server";

import { revalidatePath } from "next/cache";
import { setBotConfig, resumeBot } from "./botConfig";
import { createProject, deleteProject } from "./projects";
import { sendTelegramAlert } from "./trading";

// 1. Contact Form Submit Action
export async function submitContactAction(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const subject = formData.get("subject")?.toString() || "";
  const message = formData.get("message")?.toString() || "";
  const honey = formData.get("honey")?.toString() || "";

  // Anti-spam honeypot
  if (honey) {
    return { success: true, message: "Your message has been sent successfully!" };
  }

  if (!name || !email || !subject || !message) {
    return { success: false, message: "All fields are required." };
  }

  // Log contact submission
  console.log("Contact form submission:", JSON.stringify({ name, email, subject, message }));

  // Optional Telegram Notification (if credentials are set)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    try {
      const text = `📩 <b>New Contact Message</b>\n\n` +
                   `<b>Name:</b> ${name}\n` +
                   `<b>Email:</b> ${email}\n` +
                   `<b>Subject:</b> ${subject}\n\n` +
                   `<b>Message:</b>\n${message}`;
      
      await sendTelegramAlert(text);
    } catch (e: any) {
      console.error("Failed to send Telegram notification:", e.message);
    }
  }

  return { success: true, message: "Your message has been sent successfully!" };
}

// 2. Save Trading Bot Config Action
export async function saveConfigAction(formData: FormData) {
  try {
    const rsi_buy = parseFloat(formData.get("rsi_buy")?.toString() || "30");
    const rsi_sell = parseFloat(formData.get("rsi_sell")?.toString() || "70");
    const trade_amount_usdt = parseFloat(formData.get("trade_amount_usdt")?.toString() || "15");
    const use_ema_filter = formData.get("use_ema_filter") === "true" || formData.get("use_ema_filter") === "on";
    const symbol = formData.get("symbol")?.toString() || "WLDUSDT";
    const timeframe = formData.get("timeframe")?.toString() || "15m";
    const daily_max_loss_usdt = parseFloat(formData.get("daily_max_loss_usdt")?.toString() || "5");
    const drawdown_limit_pct = parseFloat(formData.get("drawdown_limit_pct")?.toString() || "10");

    const available_symbols_raw = formData.get("available_symbols")?.toString();
    const available_symbols = available_symbols_raw 
      ? available_symbols_raw.split(",").map(s => s.trim().toUpperCase())
      : ["WLDUSDT", "BTCUSDT"];

    await setBotConfig({
      rsi_buy,
      rsi_sell,
      trade_amount_usdt,
      use_ema_filter,
      symbol,
      timeframe,
      daily_max_loss_usdt,
      drawdown_limit_pct,
      available_symbols,
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Configuration saved successfully!" };
  } catch (error: any) {
    console.error("saveConfigAction error:", error);
    return { success: false, message: error.message || "Failed to save configuration." };
  }
}

// 3. Resume Bot Action
export async function resumeBotAction() {
  try {
    await resumeBot();
    revalidatePath("/dashboard");
    return { success: true, message: "Trading bot resumed successfully!" };
  } catch (error: any) {
    console.error("resumeBotAction error:", error);
    return { success: false, message: "Failed to resume trading bot." };
  }
}

// 4. Create Project Action
export async function createProjectAction(formData: FormData) {
  try {
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const tagsString = formData.get("tags")?.toString() || "";
    const project_url = formData.get("project_url")?.toString() || "";
    const github_url = formData.get("github_url")?.toString() || "";
    const custom_image_url = formData.get("image_url")?.toString() || "";

    if (!title || !description || !tagsString) {
      return { success: false, message: "Title, description, and tags are required." };
    }

    const tags = tagsString.split(",").map(t => t.trim()).filter(Boolean);

    // Image logic:
    // If a custom image URL was provided, use it. Otherwise, generate a stock Unsplash image fallback.
    let image_url = custom_image_url;
    if (!image_url) {
      const keywords = encodeURIComponent(title.split(" ").slice(0, 2).join(","));
      image_url = `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80`;
    }

    await createProject({
      title,
      description,
      tags,
      image_url,
      project_url: project_url || undefined,
      github_url: github_url || undefined,
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Project published successfully!" };
  } catch (error: any) {
    console.error("createProjectAction error:", error);
    return { success: false, message: "Failed to create project." };
  }
}

// 5. Delete Project Action
export async function deleteProjectAction(id: string) {
  try {
    await deleteProject(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Project deleted successfully!" };
  } catch (error: any) {
    console.error("deleteProjectAction error:", error);
    return { success: false, message: "Failed to delete project." };
  }
}
