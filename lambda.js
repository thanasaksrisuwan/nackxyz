const serverless = require("serverless-http");
const path = require("path");

// Set production environment
process.env.NODE_ENV = "production";

const NextServer = require("next/dist/server/next-server").default;
const requiredFiles = require("./.next/required-server-files.json");

const nextServer = new NextServer({
  hostname: "localhost",
  port: 3000,
  dir: path.join(__dirname),
  dev: false,
  customServer: false,
  conf: requiredFiles.config,
});

const handler = nextServer.getRequestHandler();

const fs = require("fs");
const serverlessHandler = serverless(async (req, res) => {
  const parsedUrl = new URL(req.url, "http://localhost");
  const pathname = parsedUrl.pathname;

  // Intercept and serve static files manually
  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/public/") || pathname === "/favicon.ico") {
    let filePath;
    if (pathname.startsWith("/_next/static/")) {
      filePath = path.join(__dirname, ".next", "static", pathname.replace("/_next/static/", ""));
    } else if (pathname === "/favicon.ico") {
      filePath = path.join(__dirname, "public", "favicon.ico");
    } else {
      filePath = path.join(__dirname, "public", pathname.replace("/public/", ""));
    }

    try {
      if (fs.existsSync(filePath)) {
        const ext = path.extname(pathname) || ".ico";
        const mimeTypes = {
          ".js": "application/javascript",
          ".css": "text/css",
          ".woff2": "font/woff2",
          ".woff": "font/woff",
          ".ttf": "font/ttf",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
          ".json": "application/json",
          ".txt": "text/plain",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";
        const content = fs.readFileSync(filePath);
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.end(content);
        return;
      }
    } catch (e) {
      console.error("Error serving static file:", e);
    }
  }

  return handler(req, res);
}, {
  binary: ["*/*"]
});

module.exports.handler = async (event, context) => {
  // Check if this is an EventBridge cron scheduled event
  if (event.source === "aws.events") {
    console.log("EventBridge cron trigger received. Mapping request to /api/trade route...");
    
    const token = process.env.MCP_TOKEN || "mcp-secret-lab-token";
    
    // Mock an HTTP Gateway V2 payload for Next.js routing
    const mockHttpEvent = {
      version: "2.0",
      routeKey: "POST /api/trade",
      rawPath: "/api/trade",
      rawQueryString: `token=${token}`,
      headers: {
        host: "localhost",
        authorization: `Bearer ${token}`,
      },
      requestContext: {
        http: {
          method: "POST",
          path: "/api/trade",
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "AWS-EventBridge-Cron",
        },
      },
      isBase64Encoded: false,
    };

    try {
      const response = await serverlessHandler(mockHttpEvent, context);
      console.log("TradeBot cron cycle finished. Response:", JSON.stringify(response));
      return response;
    } catch (err) {
      console.error("TradeBot cron cycle failed:", err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // Otherwise, handle as normal web traffic
  return serverlessHandler(event, context);
};
