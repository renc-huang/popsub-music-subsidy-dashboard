---
title: 採購案探索
---

# 採購案探索

文化部影視及流行音樂產業局流行音樂產業組（job_number 為 D 前綴）歷年採購標案。每個標案僅保留一筆記錄，決標公告優先。

```js
import {
  psTokens, psPlot, psGrid, psCard, psSub, psSrc,
  psValueLabel, psSqrtR, PS_STROKE, toOku, fmtInt
} from "./components/theme.js";

const t = psTokens(dark);
const rawData = await FileAttachment("data/procurement_clean.csv").csv({typed: true});
const data = rawData.map((d) => ({
  ...d,
  total_award_amount: +String(d.total_award_amount || 0).replace(/,/g, ""),
  budget_amount: +String(d.budget_amount || 0).replace(/,/g, ""),
  fiscal_year: +d.fiscal_year || null
}));
```

```js
const years = [...new Set(data.map((d) => d.fiscal_year))].filter(Boolean).sort((a, b) => b - a);
const types = [...new Set(data.map((d) => d.type))].filter(Boolean).sort();
```

```js
const selectedYear = view(Inputs.select([null, ...years], {
  label: "年度",
  format: (d) => (d ? `${d} 年` : "全部年度"),
  value: null
}));
const selectedType = view(Inputs.select([null, ...types], {
  label: "公告類型",
  format: (d) => d || "全部類型",
  value: null
}));
const searchText = view(Inputs.text({
  label: "搜尋（標案名稱／得標廠商）",
  placeholder: "輸入關鍵字…",
  width: 300
}));
```

```js
const filtered = data.filter((d) => {
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

const filteredTotal = d3.sum(filtered, (d) => d.total_award_amount || 0);
const winnerCount = new Set(
  filtered.flatMap((d) => (d.winner_names || "").split(",").filter(Boolean).map((s) => s.trim()))
).size;
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <p class="ps-kpi-label">篩選結果</p>
    <span class="ps-kpi-value">${fmtInt(filtered.length)}</span>
    <p class="ps-kpi-note">筆標案 · 101–115 年度</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">決標總額</p>
    <span class="ps-kpi-value">${toOku(filteredTotal).toFixed(2)}</span>
    <p class="ps-kpi-note">億元 · 平均每案 ${fmtInt(filtered.length ? filteredTotal / filtered.length : 0)} 元</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">得標廠商數</p>
    <span class="ps-kpi-value">${fmtInt(winnerCount)}</span>
    <p class="ps-kpi-note">家不重複得標廠商</p>
  </div>
</div>

```js
// ── 年度軌：mono 為底，單年高點給唯一強調色 ──
const byYear = d3.rollups(
  filtered.filter((d) => d.total_award_amount > 0 && d.fiscal_year),
  (v) => ({total: d3.sum(v, (d) => d.total_award_amount), count: v.length}),
  (d) => d.fiscal_year
).map(([year, m]) => ({year, ...m})).sort((a, b) => a.year - b.year);

const yearPeak = d3.greatest(byYear, (d) => d.total);
```

```js
byYear.length
  ? psCard(
      {
        title: yearPeak
          ? `目前篩選範圍下，${yearPeak.year} 年度以 ${toOku(yearPeak.total).toFixed(2)} 億元的決標金額居首`
          : "年度決標金額",
        sub: psSub("決標公告金額加總", "軸自零起算，未截斷", `${d3.min(byYear, (d) => d.year)}–${d3.max(byYear, (d) => d.year)} 年度`),
        source: psSrc("政府電子採購網", "經 g0v pcc-api 取得")
      },
      Plot.plot(psPlot(t, {
        width,
        height: 320,
        x: {label: "年度（民國）", tickFormat: (d) => `${d}`, labelAnchor: "right"},
        y: {label: "決標總額（億元）", domain: [0, d3.max(byYear, (d) => d.total) * 1.12], tickFormat: (d) => (d / 1e8).toFixed(1)},
        marks: [
          Plot.gridY(psGrid(t)),
          Plot.barY(byYear, {
            x: "year", y: "total",
            fill: (d) => (d === yearPeak ? t.hero : t.ladder[2]),
            tip: true,
            title: (d) => `${d.year} 年度\n決標總額 ${toOku(d.total).toFixed(2)} 億元\n標案數 ${fmtInt(d.count)} 件`
          }),
          Plot.text(byYear, psValueLabel(t, {
            x: "year", y: "total", dy: -8,
            text: (d) => toOku(d.total).toFixed(1)
          })),
          Plot.ruleY([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前篩選條件下沒有決標資料。</p>`
```

```js
// ── 公告類型：件數分布，柱長即件數，不斷軸 ──
const byType = d3.rollups(
  filtered.filter((d) => d.type),
  (v) => ({count: v.length, total: d3.sum(v, (d) => d.total_award_amount || 0)}),
  (d) => d.type
).map(([type, m]) => ({type, ...m})).sort((a, b) => b.count - a.count);
```

```js
byType.length
  ? psCard(
      {
        title: `「${byType[0].type}」佔目前標案筆數的 ${(byType[0].count / d3.sum(byType, (d) => d.count) * 100).toFixed(0)}%`,
        sub: psSub("柱長＝標案筆數", "圓點面積＝決標金額（開根號編碼）", `共 ${byType.length} 種公告類型`),
        source: psSrc("政府電子採購網", "經 g0v pcc-api 取得")
      },
      Plot.plot(psPlot(t, {
        width,
        height: Math.max(200, byType.length * 34 + 60),
        marginLeft: 132,
        marginRight: 64,
        x: {label: "標案筆數", domain: [0, d3.max(byType, (d) => d.count) * 1.18]},
        y: {label: null, domain: byType.map((d) => d.type)},
        r: psSqrtR,
        marks: [
          Plot.gridX(psGrid(t)),
          Plot.barX(byType, {
            x: "count", y: "type",
            fill: (d, i) => (i === 0 ? t.hero : t.ramp[3]),
            tip: true,
            title: (d) => `${d.type}\n標案筆數 ${fmtInt(d.count)} 件\n決標總額 ${toOku(d.total).toFixed(2)} 億元`
          }),
          Plot.dot(byType, {x: "count", y: "type", r: "total", fill: t.ink, fillOpacity: 0.85}),
          Plot.text(byType, psValueLabel(t, {
            x: "count", y: "type", dx: 12, textAnchor: "start",
            text: (d) => fmtInt(d.count)
          })),
          Plot.ruleX([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前篩選條件下沒有公告類型資料。</p>`
```

```js
// 廠商顯示名稱：去除尾端括號內的英文別名（僅供圖表顯示，不改動原始資料）
const cleanDisplayName = (name) =>
  name.replace(/\s*[\(（][A-Za-z][^)）]*[\)）]\s*$/, "").trim();

const winners = filtered.flatMap((d) => {
  const names = (d.winner_names || "").split(",").filter(Boolean);
  return names.map((name) => ({
    name: cleanDisplayName(name.trim()),
    amount: d.total_award_amount || 0
  }));
});

const topWinners = d3.rollups(
  winners.filter((d) => d.name),
  (v) => ({total: d3.sum(v, (d) => d.amount), count: v.length}),
  (d) => d.name
).map(([name, m]) => ({name, ...m}))
  .sort((a, b) => b.total - a.total)
  .slice(0, 20);
```

```js
topWinners.length
  ? psCard(
      {
        title: filteredTotal
          ? `前 20 名廠商吃下 ${(d3.sum(topWinners, (d) => d.total) / filteredTotal * 100).toFixed(0)}% 的決標金額`
          : "得標金額前 20 名廠商",
        sub: psSub("柱長＝累計得標金額", "圓點面積＝得標案件數（開根號編碼）", `共 ${fmtInt(winnerCount)} 家廠商`),
        source: psSrc("政府電子採購網", "經 g0v pcc-api 取得")
      },
      Plot.plot(psPlot(t, {
        width,
        height: 560,
        marginLeft: 250,
        marginRight: 76,
        x: {label: "得標總額（億元）", domain: [0, d3.max(topWinners, (d) => d.total) * 1.2], tickFormat: (d) => (d / 1e8).toFixed(2)},
        y: {label: null, domain: topWinners.map((d) => d.name)},
        r: psSqrtR,
        marks: [
          Plot.gridX(psGrid(t)),
          Plot.barX(topWinners, {
            x: "total", y: "name",
            fill: (d, i) => (i === 0 ? t.hero : t.data),
            tip: true,
            title: (d) => `${d.name}\n累計得標 ${fmtInt(d.total)} 元\n得標案件 ${fmtInt(d.count)} 件`
          }),
          Plot.dot(topWinners, {x: "total", y: "name", r: "count", fill: t.ink, fillOpacity: 0.85}),
          Plot.text(topWinners, psValueLabel(t, {
            x: "total", y: "name", dx: 12, textAnchor: "start",
            text: (d) => toOku(d.total).toFixed(2)
          })),
          Plot.ruleX([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前篩選條件下沒有得標廠商資料。</p>`
```

## 明細表

```js
Inputs.table(filtered, {
  columns: ["fiscal_year", "title", "winner_names", "total_award_amount", "budget_amount", "type", "date_formatted"],
  header: {
    fiscal_year: "年度",
    title: "標案名稱",
    winner_names: "得標廠商",
    total_award_amount: "決標金額（元）",
    budget_amount: "預算金額（元）",
    type: "公告類型",
    date_formatted: "日期"
  },
  sort: "total_award_amount",
  reverse: true,
  rows: 20
})
```

<p class="ps-src">資料來源：政府電子採購網，經 g0v pcc-api 取得 · 整理：中正大學傳播學系 POP/SUB 研究室</p>
