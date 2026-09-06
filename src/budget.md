---
title: 預決算分析
---

# 預決算分析

文化部影視及流行音樂產業局「流行音樂產業輔導」項目歷年法定預算與決算審定數對照，並拆解法定預算中各補助項目的金額配置。

```js
import {
  psTokens, psPlot, psGrid, psCard, psSub, psSrc, psLegend,
  psValueLabel, psSqrtR, PS_STROKE, toOku, fmtInt
} from "./components/theme.js";

const t = psTokens(dark);
const budget = await FileAttachment("data/budget_summary.csv").csv({typed: true});
const analysis = await FileAttachment("data/subsidy_analysis_clean.csv").csv({typed: true});
```

```js
const budgetRows = budget.filter((d) => d.budget_amount);
const settlementRows = budget.filter((d) => d.settlement_amount);
const rateRows = budget.filter((d) => d.execution_rate);

const firstYear = d3.min(budgetRows, (d) => d.fiscal_year);
const lastYear = d3.max(budgetRows, (d) => d.fiscal_year);
const budgetMax = d3.max(budget, (d) => Math.max(d.budget_amount || 0, d.settlement_amount || 0));
const avgRate = d3.mean(rateRows, (d) => d.execution_rate);
const lowestRate = d3.least(rateRows, (d) => d.execution_rate);
const budgetGrowth = (() => {
  const a = budgetRows.find((d) => d.fiscal_year === firstYear)?.budget_amount;
  const b = budgetRows.find((d) => d.fiscal_year === lastYear)?.budget_amount;
  return a && b ? b / a : null;
})();
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <p class="ps-kpi-label">涵蓋年度</p>
    <span class="ps-kpi-value">${budget.length}</span>
    <p class="ps-kpi-note">個年度 · ${firstYear}–${lastYear} 年度法定預算與決算審定數</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">平均執行率</p>
    <span class="ps-kpi-value">${avgRate ? avgRate.toFixed(1) : "—"}</span>
    <p class="ps-kpi-note">％ · 最低為 ${lowestRate ? `${lowestRate.fiscal_year} 年度的 ${lowestRate.execution_rate}％` : "—"}</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">預算成長</p>
    <span class="ps-kpi-value">${budgetGrowth ? `${budgetGrowth.toFixed(1)}×` : "—"}</span>
    <p class="ps-kpi-note">${firstYear} 至 ${lastYear} 年度法定預算倍數</p>
  </div>
</div>

```js
psCard(
  {
    title: budgetGrowth
      ? `法定預算自 ${firstYear} 年度到 ${lastYear} 年度成長 ${budgetGrowth.toFixed(1)} 倍，決算始終貼著預算走`
      : "法定預算與決算審定數逐年對照",
    sub: psSub("法定預算（實線）", "決算審定數（虛線）", `${firstYear}–${lastYear} 年度`),
    source: psSrc("文化部影視及流行音樂產業局法定預算與決算審定本")
  },
  Plot.plot(psPlot(t, {
    width,
    height: 400,
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
        tip: true, title: (d) => `${d.fiscal_year} 年度\n決算審定數 ${toOku(d.settlement_amount).toFixed(2)} 億元 · 執行率 ${d.execution_rate}％`
      }),
      Plot.text(budgetRows.filter((d) => d.fiscal_year === lastYear), psValueLabel(t, {
        x: "fiscal_year", y: "budget_amount",
        text: (d) => `${toOku(d.budget_amount).toFixed(1)} 億`,
        fill: t.data, dy: -12, textAnchor: "end"
      }))
    ]
  }))
)
```

```js
psLegend([
  {label: "法定預算", color: t.data},
  {label: "決算審定數", color: t.ladder[1], dash: true}
])
```

```js
// ── 執行率：柱長自零起算不斷軸，最低年度給唯一強調色 ──
const rateLow = d3.least(rateRows, (d) => d.execution_rate);
```

```js
rateRows.length
  ? psCard(
      {
        title: rateLow
          ? `執行率長年落在 ${d3.min(rateRows, (d) => d.execution_rate).toFixed(0)}–${d3.max(rateRows, (d) => d.execution_rate).toFixed(0)}％ 之間，${rateLow.fiscal_year} 年度最低`
          : "歷年決算執行率",
        sub: psSub("決算審定數 ÷ 法定預算", "軸自零起算，未截斷", `${d3.min(rateRows, (d) => d.fiscal_year)}–${d3.max(rateRows, (d) => d.fiscal_year)} 年度`),
        source: psSrc("文化部影視及流行音樂產業局決算審定本")
      },
      Plot.plot(psPlot(t, {
        width,
        height: 300,
        x: {label: "年度（民國）", tickFormat: (d) => `${d}`, labelAnchor: "right"},
        y: {label: "執行率（％）", domain: [0, 110], tickFormat: (d) => `${d}`},
        marks: [
          Plot.gridY(psGrid(t)),
          Plot.barY(rateRows, {
            x: "fiscal_year", y: "execution_rate",
            fill: (d) => (d === rateLow ? t.hero : t.ramp[3]),
            tip: true,
            title: (d) => `${d.fiscal_year} 年度\n執行率 ${d.execution_rate}％`
          }),
          Plot.ruleY([100], {stroke: t.muted, strokeWidth: PS_STROKE.hairline, strokeDasharray: "2 4"}),
          Plot.text(rateRows, psValueLabel(t, {
            x: "fiscal_year", y: "execution_rate", dy: -8,
            text: (d) => d.execution_rate.toFixed(0)
          })),
          Plot.ruleY([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前沒有執行率資料。</p>`
```

```js
// ── 補助經費分析：法定預算中各補助項目的金額配置 ──
const analysisRows = analysis.filter((d) => d.amount_twd > 0 && d.item_name);

const byItem = d3.rollups(
  analysisRows,
  (v) => ({total: d3.sum(v, (d) => d.amount_twd), count: v.length}),
  (d) => d.item_name
).map(([item, m]) => ({item, ...m}))
  .sort((a, b) => b.total - a.total)
  .slice(0, 15);

const analysisTotal = d3.sum(analysisRows, (d) => d.amount_twd);
```

```js
byItem.length
  ? psCard(
      {
        title: `「${byItem[0].item}」一項就佔補助經費分析表的 ${(byItem[0].total / analysisTotal * 100).toFixed(0)}%`,
        sub: psSub("柱長＝各項目累計編列金額", "圓點面積＝編列次數（開根號編碼）", `取前 ${byItem.length} 項 · 共 ${fmtInt(analysisRows.length)} 筆明細`),
        source: psSrc("文化部影視及流行音樂產業局法定預算捐助（補助）經費分析表")
      },
      Plot.plot(psPlot(t, {
        width,
        height: Math.max(240, byItem.length * 34 + 60),
        marginLeft: 260,
        marginRight: 76,
        x: {label: "累計編列金額（億元）", domain: [0, d3.max(byItem, (d) => d.total) * 1.2], tickFormat: (d) => (d / 1e8).toFixed(2)},
        y: {label: null, domain: byItem.map((d) => d.item)},
        r: psSqrtR,
        marks: [
          Plot.gridX(psGrid(t)),
          Plot.barX(byItem, {
            x: "total", y: "item",
            fill: (d, i) => (i === 0 ? t.hero : t.data),
            tip: true,
            title: (d) => `${d.item}\n累計編列 ${fmtInt(d.total)} 元\n編列次數 ${fmtInt(d.count)} 筆`
          }),
          Plot.dot(byItem, {x: "total", y: "item", r: "count", fill: t.ink, fillOpacity: 0.85}),
          Plot.text(byItem, psValueLabel(t, {
            x: "total", y: "item", dx: 12, textAnchor: "start",
            text: (d) => toOku(d.total).toFixed(2)
          })),
          Plot.ruleX([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前沒有補助經費分析資料。</p>`
```

## 預決算對照表

```js
Inputs.table(budget, {
  columns: ["fiscal_year", "budget_amount", "settlement_amount", "execution_rate"],
  header: {
    fiscal_year: "年度",
    budget_amount: "法定預算（元）",
    settlement_amount: "決算審定數（元）",
    execution_rate: "執行率（％）"
  },
  sort: "fiscal_year",
  reverse: true
})
```

<p class="ps-src">資料來源：文化部影視及流行音樂產業局法定預算與決算審定本 · 整理：中正大學傳播學系 POP/SUB 研究室</p>
