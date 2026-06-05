# 📈 Serverless Binance TH Trading Bot

## 🎯 Project Overview
This project is an automated cryptocurrency trading bot specifically designed for **Binance TH**. It is built with a heavy emphasis on **Security (Enterprise Best Practices)** and **Cost-Efficiency (100% AWS Free Tier)**. 

The system operates autonomously in the cloud, fetching real-time market data, evaluating custom trading strategies, executing secure trades, and notifying the owner—all without incurring monthly server costs.

---

## 🏗️ Architecture & Tech Stack
The project abandons traditional 24/7 servers (like EC2 or DigitalOcean) in favor of a modern **Event-Driven Serverless Architecture**.

- **Core Framework**: Laravel 11 (PHP 8.3)
- **Cloud Provider**: AWS (Amazon Web Services)
- **Serverless Engine**: [Bref](https://bref.sh/) + Serverless Framework (v3)
- **Compute**: AWS Lambda (Executes code only when triggered, zero idle cost)
- **Database**: Amazon DynamoDB (Always Free NoSQL database up to 25GB)
- **Task Scheduler**: AWS EventBridge (Triggers the bot every 1 minute)
- **CI/CD**: GitHub Actions (Automated deployments)

---

## 🔐 Security Standards & Best Practices
Security is the highest priority in this architecture, designed to completely mitigate the risk of stolen funds or compromised servers:

1. **Zero Hardcoded Secrets**: `BINANCE_API_KEY`, `BINANCE_API_SECRET`, Telegram tokens, and Admin credentials are strictly managed via **GitHub Secrets**. They are never committed to the Git repository.
2. **Ephemeral Compute**: Because it runs on AWS Lambda, there is no physical or virtual server for hackers to SSH into. The environment is destroyed and recreated constantly.
3. **IAM Least Privilege**: The AWS Lambda execution role is strictly scoped to only allow reading and writing to the specific DynamoDB `TradesTable` and nothing else.
4. **Cryptographic Signing**: All Binance API requests are signed dynamically using HMAC SHA-256 with timestamp validation to prevent Replay Attacks.
5. **Secure Dashboard Access**: The public-facing endpoint is protected by Basic Authentication. Credentials are dynamically injected at deploy-time via GitHub Secrets.

---

## 🚀 Features Implemented

### 1. Advanced Trading Brain (`TradeBot.php`)
- An artisan command (`trade:run`) serves as the bot's brain.
- Automatically invoked every 1 minute by AWS EventBridge.
- Currently tracking the **WLDUSDT** trading pair.
- **RSI Algorithm**: Fetches 15-minute K-lines (last 100 candles), applies Wilder's Smoothing Method to calculate the Relative Strength Index (RSI).
- **Position State Constraints**: Checks live account balances to prevent double-buying spam. Only buys if holding < $5 worth of WLD.
- **Dynamic Quantity**: Automatically calculates the amount of WLD to buy based on a fixed $15 USDT budget to seamlessly bypass the Binance `MIN_NOTIONAL` filter.
- **Clock Drift Protection**: Includes a `recvWindow` of 10000ms to prevent `-1021 INVALID_TIMESTAMP` rejections from Binance.

### 2. Live Secure Dashboard
- A premium, glassmorphism-styled web interface accessible at the root URL.
- Protected by HTTP Basic Authentication middleware.
- Displays real-time `WLDUSDT` prices and enumerates all non-zero asset balances directly from the Binance TH account.

### 3. Immutable Trade Logging
- All successful trade decisions (Action, Price, Quantity, Symbol, Timestamp) are permanently recorded in an **Amazon DynamoDB** table (`TradesTable`) for performance tracking and auditing.

### 4. Real-Time Telegram Notifications
- Implemented an ultra-low-latency alert system. Upon any successful trade execution, a formatted HTML alert is fired instantly to the owner's private Telegram chat using the Telegram Bot API.

---

## 🔧 Setup & Deployment
This project uses GitHub Actions for CI/CD. To deploy to your own AWS account, configure the following secrets in your GitHub Repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `BINANCE_API_KEY`
- `BINANCE_API_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `ADMIN_USERNAME` (For Dashboard Login)
- `ADMIN_PASSWORD` (For Dashboard Login)

Pushing to the `main` branch will automatically trigger the deployment to AWS Lambda.

---

## ⏭️ Roadmap
- [ ] Monitor Test Orders (`/api/v3/order/test`) to validate RSI threshold accuracy.
- [ ] Switch to Production Mode by removing the `/test` endpoint from `TradeBot.php`.
