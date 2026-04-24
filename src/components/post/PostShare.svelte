<script lang="ts">
  import QRCode from "qrcode";

  interface Props {
    url: string;
    title: string;
    copyTitle?: boolean;
    qrCode?: boolean;
  }

  const { url, title, copyTitle = false, qrCode = true }: Props = $props();

  let copied = $state(false);
  let qrVisible = $state(false);
  let qrLoading = $state(false);
  let qrDataUrl = $state("");
  let errorMessage = $state("");
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  const copyText = $derived(copyTitle ? `${title}\n${url}` : url);

  async function copyToClipboard() {
    errorMessage = "";

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = copyText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      copied = true;
      if (copiedTimer) clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      errorMessage = "复制失败，请手动复制链接。";
    }
  }

  async function toggleQrCode() {
    if (!qrCode) return;

    errorMessage = "";
    qrVisible = !qrVisible;

    if (!qrVisible || qrDataUrl) return;

    qrLoading = true;
    try {
      qrDataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#2f2f46",
          light: "#ffffff",
        },
      });
    } catch {
      qrVisible = false;
      errorMessage = "二维码生成失败，请直接复制链接。";
    } finally {
      qrLoading = false;
    }
  }
</script>

<section class="post-share" aria-labelledby="post-share-title">
  <div class="post-share__content">
    <div>
      <p class="post-share__eyebrow">Share</p>
      <h2 id="post-share-title">分享这篇文章</h2>
      <p class="post-share__desc">觉得有帮助的话，可以复制链接或用二维码分享给朋友。</p>
      <a class="post-share__fallback" href={url}>{url}</a>
    </div>

    <div class="post-share__actions">
      <button type="button" class="post-share__button" onclick={copyToClipboard}>
        <span class="i-ri-link-m" aria-hidden="true"></span>
        {copied ? "已复制" : "复制链接"}
      </button>

      {#if qrCode}
        <button
          type="button"
          class="post-share__button post-share__button--secondary"
          onclick={toggleQrCode}
          aria-expanded={qrVisible}
        >
          <span class="i-ri-qr-code-line" aria-hidden="true"></span>
          {qrVisible ? "收起二维码" : "二维码"}
        </button>
      {/if}
    </div>
  </div>

  {#if errorMessage}
    <p class="post-share__message" role="status">{errorMessage}</p>
  {/if}

  {#if qrVisible}
    <div class="post-share__qr" aria-live="polite">
      {#if qrLoading}
        <div class="post-share__qr-placeholder">生成中...</div>
      {:else if qrDataUrl}
        <img src={qrDataUrl} alt={`扫码打开：${title}`} width="240" height="240" />
        <p>扫码打开本文</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .post-share {
    margin: 2rem 0 1.5rem;
    padding: 1.125rem;
    border: 0.0625rem solid color-mix(in srgb, var(--color-blue) 16%, var(--grey-3));
    border-radius: 1rem;
    background:
      radial-gradient(circle at top right, color-mix(in srgb, var(--color-blue) 14%, transparent), transparent 42%),
      var(--body-bg-shadow);
    box-shadow: 0 0.75rem 2rem color-mix(in srgb, var(--grey-9) 8%, transparent);
  }

  .post-share__content {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }

  .post-share__eyebrow {
    margin: 0 0 0.25rem;
    color: var(--color-blue);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .post-share h2 {
    margin: 0;
    color: var(--grey-7);
    font-size: 1.15rem;
  }

  .post-share__desc {
    margin: 0.35rem 0 0;
    color: var(--grey-5);
    font-size: 0.9rem;
    line-height: 1.7;
  }

  .post-share__fallback {
    display: inline-block;
    max-width: min(100%, 32rem);
    margin-top: 0.45rem;
    overflow: hidden;
    color: var(--grey-5);
    font-size: 0.8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 0.0625rem dashed currentColor;
  }

  .post-share__actions {
    display: flex;
    flex-shrink: 0;
    gap: 0.625rem;
    align-items: center;
    justify-content: flex-end;
  }

  .post-share__button {
    display: inline-flex;
    gap: 0.375rem;
    align-items: center;
    justify-content: center;
    min-height: 2.25rem;
    padding: 0 0.875rem;
    color: var(--grey-0);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    background: var(--color-blue);
    border: 0;
    border-radius: 999rem;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease,
      box-shadow 0.2s ease;
  }

  .post-share__button:hover,
  .post-share__button:focus-visible {
    opacity: 0.9;
    transform: translateY(-0.0625rem);
    box-shadow: 0 0.5rem 1.25rem color-mix(in srgb, var(--color-blue) 24%, transparent);
  }

  .post-share__button--secondary {
    color: var(--color-blue);
    background: color-mix(in srgb, var(--color-blue) 12%, var(--grey-0));
  }

  .post-share__message {
    margin: 0.75rem 0 0;
    color: var(--color-red);
    font-size: 0.85rem;
  }

  .post-share__qr {
    display: inline-flex;
    flex-direction: column;
    gap: 0.625rem;
    align-items: center;
    margin-top: 1rem;
    padding: 0.875rem;
    background: var(--grey-0);
    border-radius: 0.875rem;
  }

  .post-share__qr img {
    display: block;
    width: 12rem;
    height: 12rem;
  }

  .post-share__qr p,
  .post-share__qr-placeholder {
    margin: 0;
    color: var(--grey-5);
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .post-share__content {
      align-items: stretch;
      flex-direction: column;
    }

    .post-share__actions {
      justify-content: flex-start;
      flex-wrap: wrap;
    }
  }
</style>
