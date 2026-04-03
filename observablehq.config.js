export default {
  title: "流行音樂補助及採購調查",
  root: "src",
  output: "dist",
  theme: ["light", "dark"],
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&family=Noto+Serif+TC:wght@600;700&display=swap" rel="stylesheet">
    <style>
      /* ── pop/sub Lab Design Tokens ── */
      :root {
        --ps-color-budget:     #2563eb;
        --ps-color-settlement: #dc2626;
        --ps-color-analysis:   #6366f1;
        --ps-color-accent:     #059669;
        --ps-text-muted:       var(--theme-foreground-muted, #666);
        --ps-font-sans:  "Noto Sans TC", var(--sans-serif);
        --ps-font-serif: "Noto Serif TC", var(--serif);
      }

      /* ── Dark mode override (手動切換用) ── */
      [data-theme="dark"] {
        --theme-foreground: #dfdfd6;
        --theme-foreground-focus: oklch(0.712564 0.257662 265.758);
        --theme-background-b: #161616;
        --theme-background-a: color-mix(in srgb, var(--theme-foreground) 4%, var(--theme-background-b));
        --theme-background: var(--theme-background-a);
        --theme-background-alt: var(--theme-background-b);
        --theme-foreground-alt: color-mix(in srgb, var(--theme-foreground) 90%, var(--theme-background-b));
        --theme-foreground-muted: color-mix(in srgb, var(--theme-foreground) 60%, var(--theme-background-b));
        --theme-foreground-faint: color-mix(in srgb, var(--theme-foreground) 50%, var(--theme-background-b));
        --theme-foreground-fainter: color-mix(in srgb, var(--theme-foreground) 30%, var(--theme-background-b));
        --theme-foreground-faintest: color-mix(in srgb, var(--theme-foreground) 14%, var(--theme-background-b));
        --ps-color-budget:     #60a5fa;
        --ps-color-settlement: #f87171;
        --ps-color-analysis:   #a5b4fc;
        --ps-color-accent:     #34d399;
        color-scheme: dark;
        background: var(--theme-background);
        color: var(--theme-foreground);
      }
      [data-theme="light"] {
        --theme-foreground: #1b1e23;
        --theme-foreground-focus: #3b5fc0;
        --theme-background-a: #ffffff;
        --theme-background: var(--theme-background-a);
        --theme-background-alt: var(--theme-background-a);
        --theme-foreground-alt: color-mix(in srgb, var(--theme-foreground) 90%, var(--theme-background-a));
        --theme-foreground-muted: color-mix(in srgb, var(--theme-foreground) 60%, var(--theme-background-a));
        --theme-foreground-faint: color-mix(in srgb, var(--theme-foreground) 50%, var(--theme-background-a));
        --theme-foreground-fainter: color-mix(in srgb, var(--theme-foreground) 30%, var(--theme-background-a));
        --theme-foreground-faintest: color-mix(in srgb, var(--theme-foreground) 14%, var(--theme-background-a));
        --ps-color-budget:     #2563eb;
        --ps-color-settlement: #dc2626;
        --ps-color-analysis:   #6366f1;
        --ps-color-accent:     #059669;
        color-scheme: light;
        background: var(--theme-background);
        color: var(--theme-foreground);
      }

      /* ── 字體 ── */
      body, #observablehq-main { font-family: var(--ps-font-sans); font-weight: 400; }
      h1 { font-family: var(--ps-font-serif); font-weight: 700; }
      h2 { font-family: var(--ps-font-serif); font-weight: 600; }
      h3, h4, h5, h6 { font-family: var(--ps-font-sans); font-weight: 600; }
      .big { font-family: var(--ps-font-sans); font-size: 2rem; font-weight: 700; display: block; }
      .muted { color: var(--ps-text-muted); font-size: 0.85rem; }
      #observablehq-sidebar { font-family: var(--ps-font-sans); font-weight: 500; }
      #observablehq-footer { font-family: var(--ps-font-sans); font-weight: 300; font-size: 0.8rem; }
      table, label, select, input[type="text"] { font-family: var(--ps-font-sans); }

      /* ── Header ── */
      .ps-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.25rem 0; }
      .ps-theme-toggle { cursor: pointer; background: none; border: 1px solid var(--theme-foreground-faint, #ccc); border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.8rem; color: var(--theme-foreground, #333); font-family: var(--ps-font-sans); }
      .ps-theme-toggle:hover { border-color: var(--theme-foreground-muted, #999); }

      /* ── Sidebar toggle：收合時放大、加背景色使其明顯可見 ── */
      label[for="observablehq-sidebar-toggle"] {
        z-index: 100;
        width: 2.25rem;
        height: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: var(--theme-background-alt, #f5f5f5);
        border: 1px solid var(--theme-foreground-faintest, #ddd);
        transition: background 0.15s, border-color 0.15s;
      }
      label[for="observablehq-sidebar-toggle"]:hover {
        background: var(--theme-foreground-faintest, #eee);
        border-color: var(--theme-foreground-fainter, #bbb);
      }

      /* ── 頁面底部 prev/next 導航：撐滿寬度，prev 靠左 next 靠右 ── */
      #observablehq-footer nav {
        max-width: 100%;
      }

      /* ── Footer 置中 ── */
      #observablehq-footer {
        text-align: center;
      }
    </style>
    <script>
      // 初始化主題：讀取 localStorage 或跟隨系統
      (function() {
        const saved = localStorage.getItem('ps-theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
      })();
    </script>
    <!-- Tinybird Web Analytics -->
    <script defer src="https://unpkg.com/@tinybirdco/flock.js" data-token="p.eyJ1IjogIjAyODZiMWQ5LTljZjctNGI5OC1iMzUyLTJiZmE0NmUyNmEyOSIsICJpZCI6ICI1NWI3ZDBlNS05ZGZlLTRiYmMtODk3ZS03NmZkMTIxNzdlZGMiLCAiaG9zdCI6ICJhcC1lYXN0LWF3cyJ9.By4RMMXPfH2TtwA7FohLgzEY0Ql6hXjNr_pubbc06iI" data-host="https://api.ap-east-1.aws.tinybird.co"></script>
  `,
  header: `<div class="ps-header">
    <a href="https://popsublab.meme" target="_blank" title="返回 pop/sub Lab 首頁" style="color:var(--theme-foreground);text-decoration:none;font-size:0.85rem;opacity:0.7;">↩ pop/sub Lab 首頁</a>
    <button class="ps-theme-toggle" onclick="
      var html = document.documentElement;
      var current = html.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('ps-theme', next);
    ">🌓 切換主題</button>
  </div>`,
  footer: `© ${new Date().getFullYear()} pop/sub Lab`,
  pages: [
    { name: "方法論", path: "/methodology" },
    { name: "補助案", path: "/subsidy" },
    { name: "採購案", path: "/procurement" },
    { name: "預決算", path: "/budget" },
    { name: "資料下載", path: "/download" },
  ],
};
