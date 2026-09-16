import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the MooNsEvents product showcase", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>MooNsEvents — Open event operating system<\/title>/i);
  assert.match(html, /From first enquiry/);
  assert.match(html, /Guided product showcase/);
  assert.match(html, /Run it locally/);
  assert.match(html, /Core modules run locally/);
  assert.match(html, /Open-source event operating system/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("publishes the verified product screenshots", async () => {
  const response = await render();
  const html = await response.text();

  for (const screenshot of [
    "dashboard-live.png",
    "lead-workspace.png",
    "runOfShow-builder.png",
    "packages.png",
    "vendor-rfq.png",
    "asset-library.png",
    "whatsapp-banners.png",
    "analytics.png",
    "command-center.png",
    "mission-control.png",
    "maya-ops-center.png",
    "maya-chat.png",
    "customer-chats.png",
  ]) {
    assert.match(html, new RegExp(`/screens/${screenshot.replace(".", "\\.")}`));
  }
});
