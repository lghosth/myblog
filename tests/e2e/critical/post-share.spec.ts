import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@critical 文章页分享卡片可展示二维码", async ({ page }) => {
  const response = await page.goto(POSTS.aiWorkflow);
  expect(response?.ok()).toBeTruthy();

  const share = page.locator(".post-share");
  await expect(share).toBeVisible();
  await expect(share.getByRole("heading", { name: "分享这篇文章" })).toBeVisible();
  await expect(share.getByRole("button", { name: "复制链接" })).toBeVisible();

  await share.getByRole("button", { name: "二维码" }).click();
  await expect(share.getByRole("img", { name: /扫码打开/ })).toBeVisible();
  await expect(share.getByText("扫码打开本文")).toBeVisible();
});
