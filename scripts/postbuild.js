const fs = require("fs");
const path = require("path");

console.log("Running platform-independent post-build script...");

const rootDir = path.join(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");
const staticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");

// 1. Copy lambda.js into standalone folder
const srcLambda = path.join(rootDir, "lambda.js");
const destLambda = path.join(standaloneDir, "lambda.js");

if (fs.existsSync(srcLambda)) {
  fs.copyFileSync(srcLambda, destLambda);
  console.log("Copied lambda.js to standalone folder.");
} else {
  console.error("Error: lambda.js source file not found!");
  process.exit(1);
}

// 2. Copy public assets into standalone folder
const destPublic = path.join(standaloneDir, "public");
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, destPublic, { recursive: true });
  console.log("Copied public assets to standalone folder.");
}

// 3. Copy static files into standalone folder
const destStatic = path.join(standaloneDir, ".next", "static");
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, destStatic, { recursive: true });
  console.log("Copied .next/static assets to standalone folder.");
}

console.log("Post-build asset staging completed successfully!");
