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

const serverlessHandler = serverless(async (req, res) => {
  return handler(req, res);
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
