import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

// Read-only, serial browsing. No form submissions, authentication attempts,
// API mutation, cron invocation, third-party analytics or member data queries.
const routes = ["/", "/om-oss", "/aktiviteter", "/utvalg", "/nyheter", "/mangfoldsposten", "/kontakt", "/bli-med"];
const output = process.env.QA_OUTPUT ?? "docs/qa";
for (const path of routes) {
  test(`public page ${path}`, async ({ page, baseURL }) => {
    let blockedWrites = 0;
    let pageErrors = 0;
    const brokenResponses: { path: string; status: number }[] = [];
    await page.route("**/*", async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (!["GET", "HEAD"].includes(request.method()) || /google-analytics|facebook\.com\/tr|doubleclick/.test(url.href)) {
        blockedWrites++;
        return route.abort();
      }
      return route.continue();
    });
    page.on("pageerror", () => { pageErrors++; });
    page.on("response", response => {
      if (response.status() >= 400) brokenResponses.push({ path: new URL(response.url()).pathname, status: response.status() });
    });
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const layout = [];
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      layout.push({ width, overflow });
      expect.soft(overflow, `${path}: horizontal overflow at ${width}`).toBe(false);
      if (path === "/") {
        await mkdir(`${output}/screenshots`, { recursive: true });
        await page.screenshot({ path: `${output}/screenshots/home-${width}.png` });
      }
    }
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length, targets: v.nodes.map(n => n.target) }));
    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: !!document.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => new URL(i.src).pathname),
      internalLinks: [...new Set([...document.querySelectorAll<HTMLAnchorElement>('a[href]')].filter(a => a.origin === location.origin).map(a => a.pathname + a.hash))],
    }));
    const id = path === "/" ? "home" : path.slice(1);
    await mkdir(`${output}/pages`, { recursive: true });
    await writeFile(`${output}/pages/${id}.json`, JSON.stringify({ baseURL, path, layout, violations, metadata, pageErrors, brokenResponses, blockedWrites }, null, 2));
    expect.soft(pageErrors, "uncaught browser errors").toBe(0);
    expect.soft(metadata.brokenImages, "broken images").toEqual([]);
    expect.soft(violations.filter(v => ["critical", "serious"].includes(v.impact ?? "")), "serious/critical axe violations").toEqual([]);
  });
}

test("anonymous admin redirects; metadata endpoints and 404", async ({ request, baseURL }) => {
  const admin = await request.get("/admin", { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(admin.status());
  expect(admin.headers().location).toContain("/admin/logg-inn");
  expect((await request.get("/qa-nonexistent-page")).status()).toBe(404);
  for (const path of ["/robots.txt", "/sitemap.xml"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    if (!baseURL?.includes("localhost")) expect(await response.text()).not.toContain("localhost");
  }
});

test("mobile navigation, desktop keyboard menu, volunteer anchor", async ({ page, baseURL }) => {
  test.skip(!baseURL?.includes("localhost"), "Interaction regression for patched local build");
  await page.goto("/");
  await page.getByRole("button", { name: "Avvis", exact: true }).click();
  await page.setViewportSize({ width: 360, height: 900 });
  await page.locator("summary").filter({ hasText: "Meny" }).click();
  await expect(page.getByRole("navigation", { name: "Mobilmeny" })).toBeVisible();
  await page.getByRole("navigation", { name: "Mobilmeny" }).getByRole("link", { name: "Om oss", exact: true }).click();
  await expect(page).toHaveURL(/om-oss/);
  await page.setViewportSize({ width: 1440, height: 900 });
  const menu = page.getByRole("navigation", { name: "Hovedmeny" }).getByRole("button", { name: "Bli med", exact: true });
  await menu.focus(); await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.locator("header").getByRole("link", { name: "Bli frivillig", exact: true }).click();
  await expect(page).toHaveURL(/bli-med#frivillig/);
  await expect(page.locator("#frivillig")).toBeInViewport();
});

test("one real detail route per content type", async ({ page }) => {
  for (const [list, prefix] of [["/aktiviteter", "/aktiviteter/"], ["/aktiviteter", "/tilbud/"], ["/utvalg", "/utvalg/"]]) {
    await page.goto(list);
    const href = await page.locator(`a[href^="${prefix}"]`).first().getAttribute("href").catch(() => null);
    if (!href) { test.info().annotations.push({ type: "blocked", description: `No public ${prefix} example available` }); continue; }
    const response = await page.goto(href);
    expect.soft(response?.status(), href).toBe(200);
    await expect.soft(page.locator("h1")).toHaveCount(1);
  }
});
