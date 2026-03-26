/**
 * Regression Test Runner Script
 *
 * Starts Next.js server, triggers regression run via API,
 * and reports results. Handles timeouts gracefully.
 *
 * Usage: npx tsx scripts/run-regression.ts [label]
 */

const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;
const TIMEOUT_MS = 30 * 60 * 1000; // 30 min for full suite

async function waitForServer(maxWaitMs = 30_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function runRegression(label?: string) {
  console.log(`\n🔬 Running regression suite${label ? ` (${label})` : ""}...`);
  console.log(`   Timeout: ${TIMEOUT_MS / 60_000} minutes\n`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/api/qa/regression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label ?? `suite-${new Date().toISOString().slice(0, 16)}` }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ API error ${res.status}: ${err}`);
      process.exit(1);
    }

    const data = await res.json();
    printResults(data);
    return data;
  } catch (error: unknown) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      console.error("❌ Regression run timed out after", TIMEOUT_MS / 60_000, "minutes");
    } else {
      console.error("❌ Regression run failed:", error);
    }
    process.exit(1);
  }
}

function printResults(data: {
  run_id: string;
  total: number;
  passed: number;
  failed: number;
  errors: number;
  avg_quality_score?: number;
  avg_confidence: number;
  avg_processing_ms: number;
  results: Array<{
    case_id: string;
    status: string;
    quality_score?: number;
    score_breakdown?: { citation: number; keyword: number; forbidden: number; confidence: number };
    confidence: string;
    failure_reasons: string[];
    processing_time_ms: number;
  }>;
}) {
  console.log("\n" + "=".repeat(60));
  console.log("  REGRESSION RESULTS");
  console.log("=".repeat(60));
  console.log(`  Run ID:     ${data.run_id}`);
  console.log(`  Total:      ${data.total}`);
  console.log(`  Passed:     ${data.passed} (${Math.round((data.passed / data.total) * 100)}%)`);
  console.log(`  Failed:     ${data.failed}`);
  console.log(`  Errors:     ${data.errors}`);
  if (data.avg_quality_score !== undefined) {
    console.log(`  Avg Quality: ${data.avg_quality_score}/100`);
  }
  console.log(`  Avg Conf:   ${Math.round(data.avg_confidence * 100)}%`);
  console.log(`  Avg Time:   ${Math.round(data.avg_processing_ms)}ms`);
  console.log("=".repeat(60));

  // Group by status
  const byStatus: Record<string, typeof data.results> = {};
  for (const r of data.results) {
    (byStatus[r.status] ??= []).push(r);
  }

  for (const [status, cases] of Object.entries(byStatus)) {
    const emoji = status === "excellent" ? "🟢" : status === "good" ? "🟡" : status === "acceptable" ? "🟠" : status === "error" ? "💥" : "🔴";
    console.log(`\n${emoji} ${status.toUpperCase()} (${cases.length}):`);
    for (const c of cases) {
      const score = c.quality_score !== undefined ? ` [Q:${c.quality_score}]` : "";
      const breakdown = c.score_breakdown
        ? ` (C:${c.score_breakdown.citation} K:${c.score_breakdown.keyword} F:${c.score_breakdown.forbidden} Cf:${c.score_breakdown.confidence})`
        : "";
      console.log(`  - ${c.case_id}${score}${breakdown} ${c.confidence} ${c.processing_time_ms}ms`);
      if (c.failure_reasons.length > 0) {
        for (const reason of c.failure_reasons) {
          console.log(`    ⚠ ${reason}`);
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
}

// ── Main ──
async function main() {
  const label = process.argv[2];

  // Check if server is already running
  console.log("🔍 Checking if server is running...");
  let serverReady = false;
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    serverReady = res.ok;
  } catch {
    // not running
  }

  if (!serverReady) {
    console.log("🚀 Starting Next.js server...");
    const { spawn } = await import("child_process");
    const server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
      cwd: process.cwd(),
      stdio: "pipe",
      shell: true,
    });

    server.stdout?.on("data", (d: Buffer) => {
      const line = d.toString().trim();
      if (line) console.log(`  [server] ${line}`);
    });
    server.stderr?.on("data", (d: Buffer) => {
      const line = d.toString().trim();
      if (line && !line.includes("ExperimentalWarning")) console.log(`  [server] ${line}`);
    });

    console.log("⏳ Waiting for server to be ready...");
    serverReady = await waitForServer(60_000);

    if (!serverReady) {
      console.error("❌ Server failed to start within 60s");
      server.kill();
      process.exit(1);
    }
    console.log("✅ Server ready\n");
  } else {
    console.log("✅ Server already running\n");
  }

  await runRegression(label);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
