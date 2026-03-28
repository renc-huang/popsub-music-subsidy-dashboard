---
title: 採購案探索
---

# 採購案探索

文化部影視及流行音樂產業局流行音樂產業組（job_number D 前綴）歷年採購標案。每個標案僅保留一筆記錄（決標優先）。

```js
import { psColors } from "./components/theme.js";
const c = psColors(dark);
const rawData = await FileAttachment("data/procurement_clean.csv").csv({typed: true});
const data = rawData.map(d => ({
  ...d,
  total_award_amount: +String(d.total_award_amount || 0).replace(/,/g, ""),
  budget_amount: +String(d.budget_amount || 0).replace(/,/g, ""),
  fiscal_year: +d.fiscal_year || null,
}));
```

```js
const years = [...new Set(data.map(d => d.fiscal_year))].filter(Boolean).sort((a, b) => b - a);
const types = [...new Set(data.map(d => d.type))].filter(Boolean).sort();
```

```js
const selectedYear = view(Inputs.select([null, ...years], {label: "年度", format: d => d ? `${d} 年` : "全部年度", value: null}));
const selectedType = view(Inputs.select([null, ...types], {label: "公告類型", format: d => d || "全部類型", value: null}));
const searchText = view(Inputs.text({label: "搜尋（標案名稱/得標廠商）", placeholder: "輸入關鍵字…", width: 300}));
```

```js
const filtered = data.filter(d => {
  if (selectedYear && d.fiscal_year !== selectedYear) return false;
  if (selectedType && d.type !== selectedType) return false;
  if (searchText) {
    const q = searchText.toLowerCase();
    const title = (d.title || "").toLowerCase();
    const winner = (d.winner_names || "").toLowerCase();
    if (!title.includes(q) && !winner.includes(q)) return false;
  }
  return true;
});
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <h2>篩選結果</h2>
    <span class="big">${filtered.length.toLocaleString()}</span> 筆標案
  </div>
  <div class="card">
    <h2>決標總額</h2>
    <span class="big">${(d3.sum(filtered, d => d.total_award_amount || 0) / 1e8).toFixed(2)}</span> 億元
  </div>
  <div class="card">
    <h2>得標廠商數</h2>
    <span class="big">${new Set(filtered.flatMap(d => (d.winner_names || "").split(",").filter(Boolean))).size.toLocaleString()}</span> 家
  </div>
</div>

## 年度決標金額

```js
const byYear = d3.rollups(
  filtered.filter(d => d.total_award_amount > 0),
  v => d3.sum(v, d => d.total_award_amount),
  d => d.fiscal_year
).map(([year, total]) => ({year, total})).sort((a, b) => a.year - b.year);
```

```js
Plot.plot({
  width,
  height: 350,
  x: {label: "年度", tickFormat: d => `${d}`},
  y: {label: "決標總額（億元）", grid: true, transform: d => d / 1e8, tickFormat: d => d.toFixed(1)},
  marks: [
    Plot.barY(byYear, {x: "year", y: "total", fill: c.settlement, tip: true}),
    Plot.ruleY([0]),
  ]
})
```

## 得標金額前 20 名廠商

```js
// 截取廠商顯示名稱：去除括號內英文（僅用於圖表顯示，不修改原始資料）
const cleanDisplayName = name => name.replace(/\s*[\(（][A-Za-z][^)\）]*[\)）]\s*$/, "").trim();

const winners = filtered.flatMap(d => {
  const names = (d.winner_names || "").split(",").filter(Boolean);
  return names.map(name => ({
    rawName: name.trim(),
    name: cleanDisplayName(name.trim()),
    amount: d.total_award_amount || 0
  }));
});
const topWinners = d3.rollups(winners, v => d3.sum(v, d => d.amount), d => d.name)
  .map(([name, total]) => ({name, total}))
  .sort((a, b) => b.total - a.total)
  .slice(0, 20);
```

```js
Plot.plot({
  width,
  height: 500,
  marginLeft: 280,
  x: {label: "得標總額（元）", grid: true},
  y: {label: null, domain: topWinners.map(d => d.name)},
  marks: [
    Plot.barX(topWinners, {x: "total", y: "name", fill: c.settlement, tip: true, sort: {y: "-x"}}),
    Plot.ruleX([0]),
  ]
})
```

## 明細表

```js
Inputs.table(filtered, {
  columns: ["fiscal_year", "title", "winner_names", "total_award_amount", "budget_amount", "type", "date_formatted"],
  header: {
    fiscal_year: "年度",
    title: "標案名稱",
    winner_names: "得標廠商",
    total_award_amount: "決標金額",
    budget_amount: "預算金額",
    type: "公告類型",
    date_formatted: "日期",
  },
  sort: "total_award_amount",
  reverse: true,
  rows: 20,
})
```

