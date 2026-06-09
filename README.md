# 📈 Full-Stack Next.js Binance TH Trading Bot & Portfolio

## 🎯 Project Overview
This project is an automated cryptocurrency trading bot and personal portfolio website. It has been migrated from a Laravel monolith to a modern **Next.js Full-Stack (App Router + Server Actions)** architecture.

The system is optimized for **Security (Enterprise Best Practices)** and **Cost-Efficiency (100% AWS Free Tier)**, executing entirely inside serverless AWS Lambda micro-VMs with no monthly server fees.

---

## 🏗️ Tech Stack
- **Core Framework**: Next.js 16 (App Router + React Server Components)
- **Database**: Amazon DynamoDB (NoSQL database, 100% stateless cloud persistence)
- **Web Services & Actions**: React Server Actions (`"use server"`)
- **API Request Interception**: Next.js 16 `proxy.ts` (Basic HTTP Authentication)
- **Trading Chart**: TradingView Lightweight-Charts Engine
- **Task Scheduler**: AWS EventBridge (Triggers the bot every 5 minutes to run RSI/EMA trading cycles)
- **Deployment**: Serverless Framework v3 + GitHub Actions

---

## 🔐 Security Standards
1. **Zero Hardcoded Secrets**: All keys (`BINANCE_API_KEY`, `BINANCE_API_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `MCP_TOKEN`) are dynamically injected via GitHub Secrets at deploy-time or loaded from local `.env` files.
2. **Proxy Interceptor**: Compliance with Next.js 16's naming conventions using `src/proxy.ts` to intercept requests and protect `/admin` and `/dashboard` panels.
3. **IAM Least Privilege**: AWS credentials only have permissions to scan/query/get/write to the specific DynamoDB table.
4. **Cryptographic Signing**: All Binance API requests are signed dynamically using HMAC SHA-256 with timestamp validation and `recvWindow` synchronization.

---

## 🚀 Key Functional Features

### 1. Automated Strategy Engine (`/api/trade`)
- The trading brain operates as a Next.js API route `/api/trade` secured by the `MCP_TOKEN` request header.
- Triggered automatically by EventBridge schedules (packaged inside the main handler in `lambda.js`).
- Uses Wilder's Smoothing Method for calculating **RSI(14)** and an Exponential Moving Average (**EMA200**).
- **Position Constraint**: Only buys if the existing base asset balance is worth less than $5 USDT.
- **Stop-Loss Protection**: Forcibly triggers a market SELL to cut losses if prices drop more than 5% below the last trade entry price.
- **Circuit Breakers**: Pauses trading instantly if daily loss reaches the custom limit (e.g. $5 USDT) or if drawdown from peak equity reaches the limit (e.g. 10%).

### 2. Live Secure Dashboard (`/dashboard`)
- Protected by browser Basic HTTP Authentication.
- Displays live ticker metrics (WLDUSDT or configured symbol), Calculated RSI, total portfolio value, and active base asset position values.
- Renders an interactive TradingView Candlestick Chart.
- Displays the last 15 trade executions directly queried from the Binance TH exchange (Single Source of Truth).
- Allows editing of thresholds (`rsi_buy`, `rsi_sell`, budgets, symbol, timeframe) dynamically using Server Actions.

### 3. Projects Administration (`/admin`)
- Allows addition of new portfolio projects and deletion of existing ones.
- Persisted in DynamoDB with a fallback default projects list if the database is unpopulated.

---

## 🔧 Setup & Development

### 1. Local Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in `.env`:
   ```env
   BINANCE_API_KEY=your_binance_api_key
   BINANCE_API_SECRET=your_binance_api_secret
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   MCP_TOKEN=mcp-secret-lab-token
   DYNAMODB_TABLE=laravel-mcp-lab-trades-dev
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_DEFAULT_REGION=ap-southeast-1
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### 2. AWS Lambda Deployment
Pushing commits to the `main` branch triggers the GitHub Actions workflow which:
1. Installs Node.js dependencies.
2. Runs `npm run build` which compiles Next.js in `standalone` output mode and stages assets via `scripts/postbuild.js`.
3. Invokes `serverless deploy --stage production` to deploy the package to AWS Lambda.
