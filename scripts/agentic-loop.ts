/**
 * Agentic Improvement Loop
 *
 * Continuous cycle:
 * 1. Run regression suite
 * 2. Analyze failures
 * 3. Generate improvement report
 * 4. Output actionable items for the next iteration
 *
 * This script generates analysis reports that Claude can act on.
 * Run via: npx tsx scripts/agentic-loop.ts
 *
 * The loop outputs structured JSON reports to stdout for each iteration,
 * which can be piped to Claude for automated improvement.
 */

const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;
const MAX_ITERATIONS = 50;
const ITERATION_TIMEOUT_MS = 35 * 60 * 1000; // 35 min per iteration

interface IterationResult {
  readonly iteration: number;
  readonly timestamp: string;
  readonly runId: string;
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly errors: number;
  readonly avgQualityScore: number;
  readonly passRate: number;
  readonly failureAnalysis: readonly FailureCluster[];
  readonly topImprovements: readonly string[];
}

interface FailureCluster {
  readonly pattern: string;
  readonly count: number;
  readonly caseIds: readonly string[];
  readonly suggestedFix: string;
}

async function waitForServer(maxWaitMs = 30_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return true;
    } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function runRegressionViaAPI(label: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ITERATION_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/api/qa/regression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function analyzeFailures(results: readonly Record<string, unknown>[]): readonly FailureCluster[] {
  const patternMap = new Map<string, { count: number; caseIds: string[] }>();

  for (const r of results) {
    const status = r.status as string;
    if (status === "excellent" || status === "good") continue;

    const reasons = (r.failure_reasons as string[]) ?? [];
    for (const reason of reasons) {
      // Cluster by failure pattern
      let pattern: string;
      if (reason.startsWith("Missing citations:")) {
        pattern = "missing_citations";
      } else if (reason.startsWith("Missing keywords:")) {
        pattern = "missing_keywords";
      } else if (reason.startsWith("Forbidden keywords found:")) {
        pattern = "forbidden_found";
      } else if (reason.startsWith("Confidence")) {
        pattern = "low_confidence";
      } else if (reason.startsWith("Error:")) {
        pattern = "runtime_error";
      } else {
        pattern = "other";
      }

      const existing = patternMap.get(pattern) ?? { count: 0, caseIds: [] };
      existing.count++;
      existing.caseIds.push(r.case_id as string);
      patternMap.set(pattern, existing);
    }
  }

  const suggestedFixes: Record<string, string> = {
    missing_citations: "Expand regulation router coverage or add missing regulations to DB",
    missing_keywords: "Improve prompt specificity or add bilingual keyword alternatives",
    forbidden_found: "Add negative examples to system prompt or tighten answer constraints",
    low_confidence: "Improve retrieval quality (more chunks, better embeddings) or lower min_confidence threshold",
    runtime_error: "Fix pipeline errors (API timeouts, parsing failures)",
    other: "Review individual case failures for unique issues",
  };

  return [...patternMap.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      caseIds: data.caseIds,
      suggestedFix: suggestedFixes[pattern] ?? "Investigate manually",
    }));
}

function generateImprovements(
  clusters: readonly FailureCluster[],
  avgQuality: number,
): readonly string[] {
  const improvements: string[] = [];

  if (clusters.some((c) => c.pattern === "missing_citations" && c.count >= 5)) {
    improvements.push("HIGH: Add more regulations to the regulation router and DB");
  }
  if (clusters.some((c) => c.pattern === "missing_keywords" && c.count >= 5)) {
    improvements.push("HIGH: Add bilingual keyword alternatives to regression cases");
  }
  if (clusters.some((c) => c.pattern === "low_confidence" && c.count >= 3)) {
    improvements.push("MEDIUM: Improve retrieval relevance scoring or add more regulation sections");
  }
  if (clusters.some((c) => c.pattern === "runtime_error" && c.count >= 2)) {
    improvements.push("CRITICAL: Fix pipeline errors before continuing");
  }
  if (avgQuality < 50) {
    improvements.push("HIGH: Overall quality is poor — focus on retrieval and prompt improvements");
  } else if (avgQuality < 70) {
    improvements.push("MEDIUM: Quality is acceptable but needs improvement in citation matching");
  }

  return improvements;
}

async function runIteration(iteration: number): Promise<IterationResult | null> {
  const label = `agentic-loop-iter-${iteration}-${new Date().toISOString().slice(0, 16)}`;
  console.error(`\n${"=".repeat(60)}`);
  console.error(`  ITERATION ${iteration} — ${new Date().toISOString()}`);
  console.error(`${"=".repeat(60)}\n`);

  const data = await runRegressionViaAPI(label);
  if (!data) {
    console.error("❌ Regression run failed");
    return null;
  }

  const results = data.results as Record<string, unknown>[];
  const total = data.total as number;
  const passed = data.passed as number;
  const failed = data.failed as number;
  const errors = data.errors as number;
  const avgQuality = (data.avg_quality_score as number) ?? 0;

  const failureAnalysis = analyzeFailures(results);
  const topImprovements = generateImprovements(failureAnalysis, avgQuality);

  const iterResult: IterationResult = {
    iteration,
    timestamp: new Date().toISOString(),
    runId: data.run_id as string,
    total,
    passed,
    failed,
    errors,
    avgQualityScore: avgQuality,
    passRate: Math.round((passed / total) * 100),
    failureAnalysis,
    topImprovements,
  };

  // Print summary to stderr (human readable)
  console.error(`  Total: ${total} | Passed: ${passed} (${iterResult.passRate}%) | Failed: ${failed} | Errors: ${errors}`);
  console.error(`  Avg Quality: ${avgQuality}/100`);
  console.error(`\n  Failure Clusters:`);
  for (const c of failureAnalysis) {
    console.error(`    ${c.pattern}: ${c.count} cases → ${c.suggestedFix}`);
  }
  console.error(`\n  Improvements:`);
  for (const imp of topImprovements) {
    console.error(`    • ${imp}`);
  }

  // Print structured JSON to stdout (machine readable)
  console.log(JSON.stringify(iterResult, null, 2));

  return iterResult;
}

async function main() {
  console.error("🤖 Agentic Improvement Loop Starting...");
  console.error(`   Max iterations: ${MAX_ITERATIONS}`);
  console.error(`   Iteration timeout: ${ITERATION_TIMEOUT_MS / 60_000} min\n`);

  // Ensure server is running
  console.error("🔍 Checking server...");
  const serverReady = await waitForServer(5000);
  if (!serverReady) {
    console.error("❌ Server not running on port", PORT);
    console.error("   Start it with: npm run dev -- -p 3099");
    process.exit(1);
  }
  console.error("✅ Server ready\n");

  const history: IterationResult[] = [];
  let consecutiveFailures = 0;

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    const result = await runIteration(i);

    if (!result) {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) {
        console.error("\n❌ 3 consecutive failures — stopping loop");
        break;
      }
      console.error("⚠️ Iteration failed, retrying in 30s...");
      await new Promise((r) => setTimeout(r, 30_000));
      continue;
    }

    consecutiveFailures = 0;
    history.push(result);

    // Check for convergence (pass rate stabilized)
    if (history.length >= 3) {
      const last3 = history.slice(-3);
      const rates = last3.map((h) => h.passRate);
      const allSame = rates.every((r) => r === rates[0]);
      if (allSame && rates[0] >= 80) {
        console.error(`\n🎯 Converged at ${rates[0]}% pass rate over 3 iterations. Stopping.`);
        break;
      }
    }

    // Check for target reached
    if (result.passRate >= 90) {
      console.error(`\n🏆 Target 90% pass rate achieved! Stopping.`);
      break;
    }

    // Wait before next iteration (give time for any improvements to be applied)
    console.error(`\n⏳ Waiting 60s before next iteration...`);
    await new Promise((r) => setTimeout(r, 60_000));
  }

  // Final summary
  console.error("\n" + "=".repeat(60));
  console.error("  LOOP SUMMARY");
  console.error("=".repeat(60));
  console.error(`  Iterations: ${history.length}`);
  if (history.length > 0) {
    console.error(`  First pass rate: ${history[0].passRate}%`);
    console.error(`  Last pass rate:  ${history[history.length - 1].passRate}%`);
    console.error(`  First quality:   ${history[0].avgQualityScore}/100`);
    console.error(`  Last quality:    ${history[history.length - 1].avgQualityScore}/100`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
