---
title: 流行音樂補助及採購調查
toc: false
---

# 流行音樂補助及採購調查

本平台聚焦音樂主題，整合文化部影視及流行音樂產業局**補助案**與**採購案**兩條軌道的公開資料。

---

```js
import { psColors } from "./components/theme.js";
const c = psColors(dark);
const subsidy = await FileAttachment("data/subsidy_clean.csv").csv({typed: true});
const procurement = await FileAttachment("data/procurement_clean.csv").csv({typed: true});
const budget = await FileAttachment("data/budget_summary.csv").csv({typed: true});
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <h2>補助案</h2>
    <span class="big">${subsidy.length.toLocaleString()}</span> 筆獲補助記錄
    <span class="muted">107–114 年度（${d3.sum(subsidy, d => d.amount_twd).toLocaleString()} 元）</span>
  </div>
  <div class="card">
    <h2>採購案</h2>
    <span class="big">${procurement.length.toLocaleString()}</span> 筆標案
    <span class="muted">101–115 年度・流行音樂產業組</span>
  </div>
  <div class="card">
    <h2>預決算</h2>
    <span class="big">${budget.length}</span> 個年度
    <span class="muted">102–114 年度法定預算與決算</span>
  </div>
</div>

## 歷年預算趨勢

```js
Plot.plot({
  width,
  height: 400,
  x: {label: "年度（民國）", tickFormat: d => `${d}`},
  y: {label: "金額（億元）", grid: true, tickFormat: d => `${(d / 1e8).toFixed(1)}`},
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(budget.filter(d => d.budget_amount), {x: "fiscal_year", y: "budget_amount", stroke: c.budget, strokeWidth: 2, tip: true}),
    Plot.lineY(budget.filter(d => d.settlement_amount), {x: "fiscal_year", y: "settlement_amount", stroke: c.settlement, strokeWidth: 2, strokeDasharray: "4,4", tip: true}),
    Plot.dot(budget.filter(d => d.budget_amount), {x: "fiscal_year", y: "budget_amount", fill: c.budget, r: 4}),
    Plot.dot(budget.filter(d => d.settlement_amount), {x: "fiscal_year", y: "settlement_amount", fill: c.settlement, r: 4}),
    Plot.text([{x: 114, y: budget.find(d => d.fiscal_year === 114)?.budget_amount, text: "法定預算"}], {x: "x", y: "y", text: "text", dx: 40, fill: c.budget}),
    Plot.text([{x: 113, y: budget.find(d => d.fiscal_year === 113)?.settlement_amount, text: "決算"}], {x: "x", y: "y", text: "text", dx: 30, fill: c.settlement}),
  ]
})
```

## 補助案：年度補助金額分布

```js
const subsidyByYear = d3.rollups(subsidy.filter(d => d.fiscal_year), v => d3.sum(v, d => d.amount_twd), d => d.fiscal_year)
  .map(([year, total]) => ({year, total}))
  .sort((a, b) => a.year - b.year);
```

```js
Plot.plot({
  width,
  height: 350,
  x: {label: "年度（民國）", tickFormat: d => `${d}`},
  y: {label: "補助總額（億元）", grid: true, tickFormat: d => `${(d / 1e8).toFixed(1)}`},
  marks: [
    Plot.barY(subsidyByYear, {x: "year", y: "total", fill: c.budget, tip: true}),
    Plot.ruleY([0]),
  ]
})
```

## 採購案：年度決標金額

```js
const procByYear = d3.rollups(
  procurement.filter(d => d.total_award_amount > 0),
  v => d3.sum(v, d => d.total_award_amount),
  d => d.fiscal_year
).map(([year, total]) => ({year, total})).sort((a, b) => a.year - b.year);
```

```js
Plot.plot({
  width,
  height: 350,
  x: {label: "年度（民國）", tickFormat: d => `${d}`},
  y: {label: "決標總額（億元）", grid: true, tickFormat: d => `${(d / 1e8).toFixed(1)}`},
  marks: [
    Plot.barY(procByYear, {x: "year", y: "total", fill: c.settlement, tip: true}),
    Plot.ruleY([0]),
  ]
})
```
