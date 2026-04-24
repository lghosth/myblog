import { expect, test } from "@playwright/test";
import { ROUTES } from "../support/routes";

test("@critical 首页暴露订阅入口与自动发现链接", async ({ request }) => {
  const response = await request.get(ROUTES.home);
  expect(response?.ok()).toBeTruthy();
  const html = await response.text();

  expect(html).toContain(
    `<link rel="alternate" type="application/rss+xml" title="RSS" href="${ROUTES.rss}">`,
  );
  expect(html).toContain(
    `<link rel="alternate" type="application/atom+xml" title="Atom" href="${ROUTES.atom}">`,
  );
  expect(html).toContain(`href="${ROUTES.rss}"`);
  expect(html).toContain("item rss");
  expect(html).toContain("i-ri-rss-line");
});

test("@critical RSS 与 Atom 订阅源可访问并包含文章", async ({ request }) => {
  const rssResponse = await request.get(ROUTES.rss);
  expect(rssResponse.ok()).toBeTruthy();
  const rssText = await rssResponse.text();
  expect(rssText).toContain('<rss version="2.0"');
  expect(rssText).toContain("<channel>");
  expect(rssText).toContain("<atom:link");
  expect(rssText).toContain("/posts/");

  const atomResponse = await request.get(ROUTES.atom);
  expect(atomResponse.ok()).toBeTruthy();
  expect(atomResponse.headers()["content-type"]).toContain("xml");
  const atomText = await atomResponse.text();
  expect(atomText).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
  expect(atomText).toContain(`<link rel="self" href="https://blog.charolron.top${ROUTES.atom}" />`);
  expect(atomText).toContain("<entry>");
  expect(atomText).toContain("/posts/");
});
