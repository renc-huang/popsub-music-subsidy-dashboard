---
title: 補助案探索
---

# 補助案探索

文化部影視及流行音樂產業局歷年獎補助名單，涵蓋製作發行、人才培訓、國際活動、跨界合製等補助類型。

```js
import {
  psTokens, psPlot, psGrid, psCard, psSub, psSrc,
  psValueLabel, psSqrtR, PS_STROKE, toOku, fmtInt
} from "./components/theme.js";

const t = psTokens(dark);
const data = await FileAttachment("data/subsidy_clean.csv").csv({typed: true});
```

```js
const years = [...new Set(data.map((d) => d.fiscal_year))].filter(Boolean).sort((a, b) => b - a);
const areas = [...new Set(data.map((d) => d.subsidy_area))].filter(Boolean).sort();
```

```js
const selectedYear = view(Inputs.select([null, ...years], {
  label: "年度",
  format: (d) => (d ? `${d} 年` : "全部年度"),
  value: null
}));
const selectedArea = view(Inputs.select([null, ...areas], {
  label: "補助業務",
  format: (d) => d || "全部業務",
  value: null
}));
```

```js
// Level 2：依已選 Level 1 動態篩選補助作業
const programsForArea = [...new Set(
  data
    .filter((d) => !selectedArea || d.subsidy_area === selectedArea)
    .map((d) => d.subsidy_program)
)].filter(Boolean).sort();

const selectedProgram = view(Inputs.select([null, ...programsForArea], {
  label: "補助作業",
  format: (d) => d || "全部作業",
  value: null
}));
```

```js
// Level 3：依已選 Level 2 動態篩選子分類
const subtypesForProgram = [...new Set(
  data
    .filter((d) => !selectedArea || d.subsidy_area === selectedArea)
    .filter((d) => !selectedProgram || d.subsidy_program === selectedProgram)
    .map((d) => d.subsidy_subtype)
)].filter(Boolean).sort();

const selectedSubtype = view(Inputs.select(
  subtypesForProgram.length > 0 ? [null, ...subtypesForProgram] : [null],
  {
    label: "子分類",
    format: (d) => d || "全部子分類",
    value: null,
    disabled: subtypesForProgram.length === 0
  }
));

const searchText = view(Inputs.text({
  label: "搜尋（受補助者／案件名稱）",
  placeholder: "輸入關鍵字…",
  width: 300
}));
```

```js
const filtered = data.filter((d) => {
  if (selectedYear && d.fiscal_year !== selectedYear) return false;
  if (selectedArea && d.subsidy_area !== selectedArea) return false;
  if (selectedProgram && d.subsidy_program !== selectedProgram) return false;
  if (selectedSubtype && d.subsidy_subtype !== selectedSubtype) return false;
  if (searchText) {
    const q = searchText.toLowerCase();
    const name = (d.recipient || "").toLowerCase();
    const title = (d.project_title || "").toLowerCase();
    if (!name.includes(q) && !title.includes(q)) return false;
  }
  return true;
});

const filteredTotal = d3.sum(filtered, (d) => d.amount_twd);
const recipientCount = new Set(filtered.map((d) => d.recipient)).size;
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <p class="ps-kpi-label">篩選結果</p>
    <span class="ps-kpi-value">${fmtInt(filtered.length)}</span>
    <p class="ps-kpi-note">筆獲補助記錄</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">補助總額</p>
    <span class="ps-kpi-value">${toOku(filteredTotal).toFixed(2)}</span>
    <p class="ps-kpi-note">億元 · 平均每筆 ${fmtInt(filtered.length ? filteredTotal / filtered.length : 0)} 元</p>
  </div>
  <div class="card">
    <p class="ps-kpi-label">受補助者數</p>
    <span class="ps-kpi-value">${fmtInt(recipientCount)}</span>
    <p class="ps-kpi-note">個不重複受補助者</p>
  </div>
</div>

```js
const byYear = d3.rollups(filtered, (v) => d3.sum(v, (d) => d.amount_twd), (d) => d.fiscal_year)
  .map(([year, total]) => ({year, total}))
  .filter((d) => d.year)
  .sort((a, b) => a.year - b.year);

const yearPeak = d3.greatest(byYear, (d) => d.total);
```

```js
byYear.length
  ? psCard(
      {
        title: yearPeak
          ? `目前篩選範圍下，${yearPeak.year} 年度以 ${toOku(yearPeak.total).toFixed(2)} 億元居首`
          : "年度補助金額",
        sub: psSub("補助金額加總", "軸自零起算，未截斷", `${d3.min(byYear, (d) => d.year)}–${d3.max(byYear, (d) => d.year)} 年度`),
        source: psSrc("文化部獎補助資訊網 grants.moc.gov.tw")
      },
      Plot.plot(psPlot(t, {
        width,
        height: 320,
        x: {label: "年度（民國）", tickFormat: (d) => `${d}`, labelAnchor: "right"},
        y: {label: "金額（億元）", domain: [0, d3.max(byYear, (d) => d.total) * 1.12], tickFormat: (d) => (d / 1e8).toFixed(1)},
        marks: [
          Plot.gridY(psGrid(t)),
          Plot.barY(byYear, {
            x: "year", y: "total",
            fill: (d) => (d === yearPeak ? t.hero : t.data),
            tip: true,
            title: (d) => `${d.year} 年度\n補助總額 ${toOku(d.total).toFixed(2)} 億元`
          }),
          Plot.text(byYear, psValueLabel(t, {
            x: "year", y: "total", dy: -8,
            text: (d) => toOku(d.total).toFixed(1)
          })),
          Plot.ruleY([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前篩選條件下沒有資料。</p>`
```

```js
// 業務別：金額決定柱長，件數以開根號面積另行編碼，避免單一維度誤讀
const byArea = d3.rollups(
  filtered.filter((d) => d.subsidy_area),
  (v) => ({total: d3.sum(v, (d) => d.amount_twd), count: v.length}),
  (d) => d.subsidy_area
).map(([area, m]) => ({area, ...m})).sort((a, b) => b.total - a.total);
```

```js
byArea.length
  ? psCard(
      {
        title: `「${byArea[0].area}」吃下這批補助的 ${(byArea[0].total / d3.sum(byArea, (d) => d.total) * 100).toFixed(0)}%`,
        sub: psSub("柱長＝補助總額", "圓點面積＝案件數（開根號編碼）", `共 ${byArea.length} 項業務`),
        source: psSrc("文化部獎補助資訊網 grants.moc.gov.tw")
      },
      Plot.plot(psPlot(t, {
        width,
        height: Math.max(220, byArea.length * 34 + 60),
        marginLeft: 132,
        marginRight: 64,
        x: {label: "補助總額（億元）", domain: [0, d3.max(byArea, (d) => d.total) * 1.18], tickFormat: (d) => (d / 1e8).toFixed(1)},
        y: {label: null, domain: byArea.map((d) => d.area)},
        r: psSqrtR,
        marks: [
          Plot.gridX(psGrid(t)),
          Plot.barX(byArea, {
            x: "total", y: "area",
            fill: (d, i) => (i === 0 ? t.hero : t.ramp[3]),
            tip: true,
            title: (d) => `${d.area}\n補助總額 ${toOku(d.total).toFixed(2)} 億元\n案件數 ${fmtInt(d.count)} 筆`
          }),
          Plot.dot(byArea, {x: "total", y: "area", r: "count", fill: t.ink, fillOpacity: 0.85}),
          Plot.text(byArea, psValueLabel(t, {
            x: "total", y: "area", dx: 12, textAnchor: "start",
            text: (d) => toOku(d.total).toFixed(2)
          })),
          Plot.ruleX([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前篩選條件下沒有業務別資料。</p>`
```

```js
const topRecipients = d3.rollups(
  filtered.filter((d) => d.recipient),
  (v) => ({total: d3.sum(v, (d) => d.amount_twd), count: v.length}),
  (d) => d.recipient
).map(([name, m]) => ({name, ...m}))
  .sort((a, b) => b.total - a.total)
  .slice(0, 20);
```

```js
topRecipients.length
  ? psCard(
      {
        title: `前 20 名受補助者拿走 ${(d3.sum(topRecipients, (d) => d.total) / filteredTotal * 100).toFixed(0)}% 的補助金額`,
        sub: psSub("柱長＝累計獲補助金額", "圓點面積＝獲補助案件數（開根號編碼）", `共 ${fmtInt(recipientCount)} 個受補助者`),
        source: psSrc("文化部獎補助資訊網 grants.moc.gov.tw")
      },
      Plot.plot(psPlot(t, {
        width,
        height: 560,
        marginLeft: 250,
        marginRight: 76,
        x: {label: "補助總額（億元）", domain: [0, d3.max(topRecipients, (d) => d.total) * 1.2], tickFormat: (d) => (d / 1e8).toFixed(2)},
        y: {label: null, domain: topRecipients.map((d) => d.name)},
        r: psSqrtR,
        marks: [
          Plot.gridX(psGrid(t)),
          Plot.barX(topRecipients, {
            x: "total", y: "name",
            fill: (d, i) => (i === 0 ? t.hero : t.data),
            tip: true,
            title: (d) => `${d.name}\n累計 ${fmtInt(d.total)} 元\n案件數 ${fmtInt(d.count)} 筆`
          }),
          Plot.dot(topRecipients, {x: "total", y: "name", r: "count", fill: t.ink, fillOpacity: 0.85}),
          Plot.text(topRecipients, psValueLabel(t, {
            x: "total", y: "name", dx: 12, textAnchor: "start",
            text: (d) => toOku(d.total).toFixed(2)
          })),
          Plot.ruleX([0], {stroke: t.grid, strokeWidth: PS_STROKE.grid})
        ]
      }))
    )
  : html`<p class="muted">目前篩選條件下沒有受補助者資料。</p>`
```

## 明細表

```js
Inputs.table(filtered, {
  columns: ["fiscal_year", "subsidy_area", "subsidy_program", "subsidy_subtype", "applicant_type", "recipient", "project_title", "amount_twd"],
  header: {
    fiscal_year: "年度",
    subsidy_area: "補助業務",
    subsidy_program: "補助作業",
    subsidy_subtype: "子分類",
    applicant_type: "申請者類型",
    recipient: "受補助者",
    project_title: "案件名稱",
    amount_twd: "金額（元）"
  },
  sort: "amount_twd",
  reverse: true,
  rows: 20
})
```

<p class="ps-src">資料來源：文化部獎補助資訊網 GRANTS.MOC.GOV.TW · 整理：中正大學傳播學系 POP/SUB 研究室</p>
