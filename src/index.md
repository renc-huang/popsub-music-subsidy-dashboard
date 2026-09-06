---
title: 流行音樂補助及採購調查
toc: false
---

# 流行音樂補助及採購調查

本平台聚焦音樂主題，整合文化部影視及流行音樂產業局**補助案**與**採購案**兩條軌道的公開資料。

```js
import {
  psTokens, psPlot, psGrid, psCard, psSub, psSrc, psLegend,
  psValueLabel, PS_STROKE, PS_DASH, toOku, fmtInt
} from "./components/theme.js";

const t = psTokens(dark);
const subsidy = await FileAttachment("data/subsidy_clean.csv").csv({typed: true});
const procurement = await FileAttachment("data/procurement_clean.csv").csv({typed: true});
const budget = await FileAttachment("data/budget_summary.csv").csv({typed: true});
```

```js
const subsidyTotal = d3.sum(subsidy, (d) => d.amount_twd);
const procurementTotal = d3.sum(procurement, (d) => d.total_award_amount || 0);
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <p class="ps-kpi-label">補助案</p>
    <span class="ps-kpi-value">${fmtInt(subsidy.length)}</span>
    <p class="ps-kpi-note">筆獲補助記錄 · 107–114 年度 · 累計 ${toOku(subsidyTotal).toFixed(2)} 億元</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">採購案</p>
    <span class="ps-kpi-value">${fmtInt(procurement.length)}</span>
    <p class="ps-kpi-note">筆標案 · 101–115 年度 · 累計 ${toOku(procurementTotal).toFixed(2)} 億元</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">預決算</p>
    <span class="ps-kpi-value">${budget.length}</span>
    <p class="ps-kpi-note">個年度 · 102–114 年度法定預算與決算審定數對照</p>
  </div>
</div>

```js
// ── 預決算：兩條軌道的差距即為結論 ──
const budgetRows = budget.filter((d) => d.budget_amount);
const settlementRows = budget.filter((d) => d.settlement_amount);
const budgetMax = d3.max(budget, (d) => Math.max(d.budget_amount || 0, d.settlement_amount || 0));
const budgetFirst = d3.min(budgetRows, (d) => d.fiscal_year);
const budgetLast = d3.max(budgetRows, (d) => d.fiscal_year);
const budgetGrowth = (() => {
  const a = budgetRows.find((d) => d.fiscal_year === budgetFirst)?.budget_amount;
  const b = budgetRows.find((d) => d.fiscal_year === budgetLast)?.budget_amount;
  return a && b ? b / a : null;
})();
```

```js
psCard(
  {
    title: budgetGrowth
      ? `法定預算自 ${budgetFirst} 年度到 ${budgetLast} 年度成長 ${budgetGrowth.toFixed(1)} 倍，決算始終貼著預算走`
      : "法定預算與決算審定數逐年對照",
    sub: psSub("法定預算（實線）", "決算審定數（虛線）", `${budgetFirst}–${budgetLast} 年度`),
    source: psSrc("文化部影視及流行音樂產業局法定預算與決算審定本")
  },
  Plot.plot(psPlot(t, {
    width,
    height: 380,
    x: {label: "年度（民國）", tickFormat: (d) => `${d}`, labelAnchor: "right"},
    y: {label: "金額（億元）", domain: [0, budgetMax * 1.08], tickFormat: (d) => (d / 1e8).toFixed(1)},
    marks: [
      Plot.gridY(psGrid(t)),
      Plot.ruleY([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid}),
      Plot.lineY(budgetRows, {
        x: "fiscal_year", y: "budget_amount",
        stroke: t.data, strokeWidth: PS_STROKE.shape, curve: "linear"
      }),
      Plot.lineY(settlementRows, {
        x: "fiscal_year", y: "settlement_amount",
        stroke: t.ladder[1], strokeWidth: PS_STROKE.shape * 0.7, strokeDasharray: "5 4"
      }),
      Plot.dot(budgetRows, {
        x: "fiscal_year", y: "budget_amount", fill: t.data, r: 3.4,
        tip: true, title: (d) => `${d.fiscal_year} 年度\n法定預算 ${toOku(d.budget_amount).toFixed(2)} 億元`
      }),
      Plot.dot(settlementRows, {
        x: "fiscal_year", y: "settlement_amount", fill: t.ladder[1], r: 3.4,
        tip: true, title: (d) => `${d.fiscal_year} 年度\n決算審定數 ${toOku(d.settlement_amount).toFixed(2)} 億元 · 執行率 ${d.execution_rate}%`
      }),
      Plot.text(budgetRows.filter((d) => d.fiscal_year === budgetLast), psValueLabel(t, {
        x: "fiscal_year", y: "budget_amount",
        text: (d) => `${toOku(d.budget_amount).toFixed(1)} 億`,
        fill: t.data, dy: -12, textAnchor: "end"
      }))
    ]
  }))
)
```

```js
// ── 補助軌：年度金額，最高年度給唯一強調色 ──
const subsidyByYear = d3.rollups(
  subsidy.filter((d) => d.fiscal_year),
  (v) => d3.sum(v, (d) => d.amount_twd),
  (d) => d.fiscal_year
).map(([year, total]) => ({year, total})).sort((a, b) => a.year - b.year);

const subsidyPeak = d3.greatest(subsidyByYear, (d) => d.total);
```

```js
psCard(
  {
    title: subsidyPeak
      ? `補助金額在 ${subsidyPeak.year} 年度攀上 ${toOku(subsidyPeak.total).toFixed(2)} 億元的高點`
      : "歷年補助金額分布",
    sub: psSub("獲補助名單金額加總", "軸自零起算，未截斷", "107–114 年度"),
    source: psSrc("文化部獎補助資訊網 grants.moc.gov.tw")
  },
  Plot.plot(psPlot(t, {
    width,
    height: 320,
    x: {label: "年度（民國）", tickFormat: (d) => `${d}`, labelAnchor: "right"},
    y: {label: "補助總額（億元）", domain: [0, d3.max(subsidyByYear, (d) => d.total) * 1.12], tickFormat: (d) => (d / 1e8).toFixed(1)},
    marks: [
      Plot.gridY(psGrid(t)),
      Plot.barY(subsidyByYear, {
        x: "year", y: "total",
        fill: (d) => (d === subsidyPeak ? t.hero : t.data),
        tip: true,
        title: (d) => `${d.year} 年度\n補助總額 ${toOku(d.total).toFixed(2)} 億元`
      }),
      Plot.text(subsidyByYear, psValueLabel(t, {
        x: "year", y: "total", dy: -8,
        text: (d) => toOku(d.total).toFixed(1)
      })),
      Plot.ruleY([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
    ]
  }))
)
```

```js
// ── 採購軌：mono 為底，最高年度給唯一強調色 ──
const procByYear = d3.rollups(
  procurement.filter((d) => d.total_award_amount > 0),
  (v) => d3.sum(v, (d) => d.total_award_amount),
  (d) => d.fiscal_year
).map(([year, total]) => ({year, total})).sort((a, b) => a.year - b.year);

const procPeak = d3.greatest(procByYear, (d) => d.total);
```

```js
psCard(
  {
    title: procPeak
      ? `採購決標金額的單年高點落在 ${procPeak.year} 年度，共 ${toOku(procPeak.total).toFixed(2)} 億元`
      : "歷年決標金額分布",
    sub: psSub("決標公告金額加總", "軸自零起算，未截斷", "101–115 年度"),
    source: psSrc("政府電子採購網", "經 g0v pcc-api 取得")
  },
  Plot.plot(psPlot(t, {
    width,
    height: 320,
    x: {label: "年度（民國）", tickFormat: (d) => `${d}`, labelAnchor: "right"},
    y: {label: "決標總額（億元）", domain: [0, d3.max(procByYear, (d) => d.total) * 1.12], tickFormat: (d) => (d / 1e8).toFixed(1)},
    marks: [
      Plot.gridY(psGrid(t)),
      Plot.barY(procByYear, {
        x: "year", y: "total",
        fill: (d) => (d === procPeak ? t.hero : t.ladder[2]),
        tip: true,
        title: (d) => `${d.year} 年度\n決標總額 ${toOku(d.total).toFixed(2)} 億元`
      }),
      Plot.text(procByYear, psValueLabel(t, {
        x: "year", y: "total", dy: -8,
        text: (d) => toOku(d.total).toFixed(1)
      })),
      Plot.ruleY([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
    ]
  }))
)
```
