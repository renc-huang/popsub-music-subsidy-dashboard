---
title: 預決算分析
---

# 預決算分析

文化部影視及流行音樂產業局「流行音樂產業輔導」項目歷年法定預算與決算審定數對照。

```js
import { psColors } from "./components/theme.js";
const c = psColors(dark);
const budget = await FileAttachment("data/budget_summary.csv").csv({typed: true});
```

## 預算 vs 決算趨勢

```js
Plot.plot({
  width,
  height: 400,
  x: {label: "年度（民國）", tickFormat: d => `${d}`},
  y: {label: "金額（億元）", grid: true, tickFormat: d => `${(d / 1e8).toFixed(1)}`},
  color: {legend: true},
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(budget.filter(d => d.budget_amount), {x: "fiscal_year", y: "budget_amount", stroke: c.budget, strokeWidth: 2.5, tip: true}),
    Plot.lineY(budget.filter(d => d.settlement_amount), {x: "fiscal_year", y: "settlement_amount", stroke: c.settlement, strokeWidth: 2, strokeDasharray: "6,3", tip: true}),
    Plot.dot(budget.filter(d => d.budget_amount), {x: "fiscal_year", y: "budget_amount", fill: c.budget, r: 5, title: d => `${d.fiscal_year}年 法定預算: ${(d.budget_amount / 1e8).toFixed(2)}億`}),
    Plot.dot(budget.filter(d => d.settlement_amount), {x: "fiscal_year", y: "settlement_amount", fill: c.settlement, r: 5, title: d => `${d.fiscal_year}年 決算: ${(d.settlement_amount / 1e8).toFixed(2)}億`}),
  ]
})
```

<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
  <span style="color: var(--ps-color-budget, #2563eb);">● 法定預算</span>
  <span style="color: var(--ps-color-settlement, #dc2626);">● 決算審定數</span>
</div>

## 預決算對照表

```js
Inputs.table(budget, {
  columns: ["fiscal_year", "budget_amount", "settlement_amount", "execution_rate"],
  header: {
    fiscal_year: "年度",
    budget_amount: "法定預算（元）",
    settlement_amount: "決算審定數（元）",
    execution_rate: "執行率（%）",
  },
  sort: "fiscal_year",
  reverse: true,
})
```
