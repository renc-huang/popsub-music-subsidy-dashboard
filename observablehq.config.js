export default {
  title: "流行音樂補助及採購調查",
  root: "src",
  output: "dist",
  // 全站樣式單一來源：src/styles.css（編輯式圖表設計系統）
  style: "styles.css",
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@600;700&display=swap" rel="stylesheet">

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
