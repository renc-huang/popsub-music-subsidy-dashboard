---
title: 資料下載
---

# 資料下載

本研究整理的結構化資料集，皆為 CSV 格式、UTF-8 編碼，可直接以 Excel、Python、R 等工具開啟。

```js
// 以 FileAttachment 取得雜湊後的實際路徑，確保下載連結在建置產物中有效
const files = [
  {
    file: FileAttachment("data/subsidy_clean.csv"),
    name: "subsidy_clean.csv",
    desc: "補助軌：獎補助名單明細（107–114 年度）",
    rows: "1,502"
  },
  {
    file: FileAttachment("data/procurement_clean.csv"),
    name: "procurement_clean.csv",
    desc: "採購軌：流行音樂產業組標案（101–115 年度，D 前綴，已去重）",
    rows: "235"
  },
  {
    file: FileAttachment("data/budget_summary.csv"),
    name: "budget_summary.csv",
    desc: "預決算：流行音樂產業輔導歷年法定預算與決算對照（102–114 年度）",
    rows: "13"
  },
  {
    file: FileAttachment("data/subsidy_analysis_clean.csv"),
    name: "subsidy_analysis_clean.csv",
    desc: "補助經費分析：法定預算中各補助項目金額明細",
    rows: "206"
  }
];
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <p class="ps-kpi-label">資料集</p>
    <span class="ps-kpi-value">4</span>
    <p class="ps-kpi-note">個 CSV 檔 · 補助、採購、預決算三軌</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">記錄總數</p>
    <span class="ps-kpi-value">1,956</span>
    <p class="ps-kpi-note">筆結構化記錄 · 101–115 年度</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">最近更新</p>
    <span class="ps-kpi-value">2026-03</span>
    <p class="ps-kpi-note">每季手動更新 · 最近更新日 2026-03-27</p>
  </div>
</div>

<figure class="ps-card">
  <h2 class="ps-title">四個資料集分別對應補助、採購與預決算三條軌道</h2>
  <p class="ps-sub">檔名 · 涵蓋範圍 · 記錄筆數</p>
  <div class="ps-figure">${
    html`<table>
      <thead><tr><th>檔案</th><th>說明</th><th style="text-align:right;">筆數</th></tr></thead>
      <tbody>${files.map((d) => html`<tr>
        <td><a href="${d.file.href}" download="${d.name}">${d.name}</a></td>
        <td>${d.desc}</td>
        <td style="text-align:right;">${d.rows}</td>
      </tr>`)}</tbody>
    </table>`
  }</div>
  <figcaption class="ps-src">整理：中正大學傳播學系 POP/SUB 研究室</figcaption>
</figure>

<figure class="ps-card">
  <h2 class="ps-title">三條軌道各有獨立的公開資料來源</h2>
  <p class="ps-sub">資料來源與取得管道</p>
  <div class="ps-figure">

- **補助軌**：[文化部獎補助資訊網](https://grants.moc.gov.tw)（grants.moc.gov.tw）
- **採購軌**：[中華民國政府電子採購網](https://web.pcc.gov.tw)，經 [g0v pcc-api](https://github.com/ronnywang/pcc.g0v.ronny.tw) 間接取得
- **預決算**：[文化部影視及流行音樂產業局](https://www.bamid.gov.tw)（bamid.gov.tw）行政公開資訊

  </div>
  <figcaption class="ps-src">採集方法詳見「方法論」頁</figcaption>
</figure>

<figure class="ps-card">
  <h2 class="ps-title">資料可為教學研究引用，但須註明出處且不得商業利用</h2>
  <p class="ps-sub">授權範圍 · 更新週期</p>
  <div class="ps-figure">

依行政院公共工程委員會著作權聲明，為**教學、研究**或其他正當目的，在合理範圍內得引用，引用時須註明出處。本資料集由中正大學傳播學系 pop/sub 研究室整理，用途為學術研究，不得作為商業利用。

資料以**每季**為週期手動更新，最近更新日期為 **2026-03-27**。

  </div>
  <figcaption class="ps-src">授權：行政院公共工程委員會著作權聲明 / 文化部開放資料</figcaption>
</figure>
