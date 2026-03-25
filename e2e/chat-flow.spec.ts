import { test, expect } from "@playwright/test";

test.describe("Chat Flow — Unauthenticated", () => {
  test("shows auth dialog when trying to send message without login", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    // Find and fill chat input
    const input = page.locator("textarea, input[type='text']").first();
    await input.waitFor({ state: "visible", timeout: 10_000 });
    await input.fill("What is SFCR?");

    // Click send button
    const sendButton = page.locator("button[type='submit'], button:has(svg)").filter({ hasText: /send|보내기|전송/i }).first();
    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      // Try pressing Enter
      await input.press("Enter");
    }

    // Should show auth dialog or error about login
    // Wait for either an auth dialog or error message
    const authDialogOrError = page.locator('[role="dialog"], [data-state="open"]').first();
    const errorMessage = page.locator("text=/로그인|sign in|Authentication/i").first();

    await expect(
      authDialogOrError.or(errorMessage),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("suggested questions are clickable", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    // Look for suggested question buttons/cards
    const suggestions = page.locator("button, [role='button']").filter({
      hasText: /식품|food|label|라벨|수입|import|SFCR|CFIA/i,
    });

    const count = await suggestions.count();
    if (count > 0) {
      // Click the first suggestion
      await suggestions.first().click();
      // Should trigger a chat message or auth dialog
      await page.waitForTimeout(2000);
      // Either the input gets filled or auth dialog shows
      const authDialog = page.locator('[role="dialog"]').first();
      const chatInput = page.locator("textarea, input[type='text']").first();

      const dialogVisible = await authDialog.isVisible().catch(() => false);
      const inputValue = await chatInput.inputValue().catch(() => "");

      expect(dialogVisible || inputValue.length > 0).toBeTruthy();
    }
  });
});

test.describe("Chat Flow — Health Check Integration", () => {
  test("verify all dependencies via health endpoint", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Supabase must be connected for the app to work at all
    expect(body.checks.supabase_anon.status).toBe("ok");
    expect(body.checks.supabase_admin.status).toBe("ok");

    // Log dependency status for debugging
    console.log("Health Check Results:");
    console.log(`  Supabase (anon): ${body.checks.supabase_anon.status} (${body.checks.supabase_anon.latencyMs}ms)`);
    console.log(`  Supabase (admin): ${body.checks.supabase_admin.status} (${body.checks.supabase_admin.latencyMs}ms)`);
    console.log(`  Anthropic: ${body.checks.anthropic.status} — ${body.checks.anthropic.message}`);
    console.log(`  OpenAI: ${body.checks.openai.status} — ${body.checks.openai.message}`);

    // If Anthropic is down, chat WILL fail
    if (body.checks.anthropic.status !== "ok") {
      console.warn("⚠ ANTHROPIC API KEY IS INVALID — Chat will fail!");
    }
    if (body.checks.openai.status !== "ok") {
      console.warn("⚠ OPENAI API KEY ISSUE — Embeddings/RAG will fail!");
    }
  });
});
