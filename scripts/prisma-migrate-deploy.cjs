/**
 * On Vercel, a previous failed migrate can leave Drift/P3009 and block builds.
 * This script resolves the known failed migration once, then retries deploy.
 */
const { execSync } = require("child_process");

const FAILED_INIT = "20260516040000_init";

function run(cmd) {
  try {
    execSync(cmd, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      shell: true,
    });
    return { ok: true };
  } catch (e) {
    const stderr = typeof e.stderr === "string" ? e.stderr : e.stderr?.toString() || "";
    const stdout = typeof e.stdout === "string" ? e.stdout : e.stdout?.toString() || "";
    return { ok: false, stderr, stdout };
  }
}

console.log("[prisma] migrate deploy...");
let result = run("npx prisma migrate deploy");

if (result.ok) {
  process.exit(0);
}

const combined = `${result.stderr}\n${result.stdout}`;

if (combined.includes("P3009")) {
  console.warn("[prisma] P3009 detected — marking failed migration as rolled back:", FAILED_INIT);
  const resolve = run(`npx prisma migrate resolve --rolled-back "${FAILED_INIT}"`);
  if (!resolve.ok) {
    console.error("[prisma] migrate resolve failed:\n", resolve.stderr || resolve.stdout);
    process.exit(1);
  }
  console.log("[prisma] retry migrate deploy...");
  result = run("npx prisma migrate deploy");
}

if (!result.ok) {
  console.error("[prisma] migrate deploy failed:\n", combined);
  console.error("[prisma] second attempt stderr:\n", result.stderr);
  process.exit(1);
}

console.log("[prisma] migrations applied OK");
