---
title: 補助案探索
---

# 補助案探索

文化部影視及流行音樂產業局歷年獎補助名單，涵蓋製作發行、人才培訓、國際活動、跨界合製等補助類型。

```js
import { psColors } from "./components/theme.js";
const c = psColors(dark);
const data = await FileAttachment("data/subsidy_clean.csv").csv({typed: true});
```

```js
const years = [...new Set(data.map(d => d.fiscal_year))].filter(Boolean).sort((a, b) => b - a);
const areas = [...new Set(data.map(d => d.subsidy_area))].filter(Boolean).sort();
```

```js
const selectedYear = view(Inputs.select([null, ...years], {
  label: "年度",
  format: d => d ? `${d} 年` : "全部年度",
  value: null
}));
const selectedArea = view(Inputs.select([null, ...areas], {
  label: "補助業務",
  format: d => d || "全部業務",
  value: null
}));
```

```js
// Level 2：依已選 Level 1 動態篩選補助作業
const programsForArea = [...new Set(
  data
    .filter(d => !selectedArea || d.subsidy_area === selectedArea)
    .map(d => d.subsidy_program)
)].filter(Boolean).sort();

const selectedProgram = view(Inputs.select([null, ...programsForArea], {
  label: "補助作業",
  format: d => d || "全部作業",
  value: null
}));
```

```js
// Level 3：依已選 Level 2 動態篩選子分類
const subtypesForProgram = [...new Set(
  data
    .filter(d => !selectedArea || d.subsidy_area === selectedArea)
    .filter(d => !selectedProgram || d.subsidy_program === selectedProgram)
    .map(d => d.subsidy_subtype)
)].filter(Boolean).sort();

const selectedSubtype = view(Inputs.select(
  subtypesForProgram.length > 0 ? [null, ...subtypesForProgram] : [null],
  {
    label: "子分類",
    format: d => d || "全部子分類",
    value: null,
    disabled: subtypesForProgram.length === 0
  }
));

const searchText = view(Inputs.text({
  label: "搜尋（受補助者/案件名稱）",
  placeholder: "輸入關鍵字…",
  width: 300
}));
```

```js
const filtered = data.filter(d => {
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
```

<div class="grid grid-cols-3" style="grid-auto-rows: auto;">
  <div class="card">
    <h2>篩選結果</h2>
    <span class="big">${filtered.length.toLocaleString()}</span> 筆
  </div>
  <div class="card">
    <h2>補助總額</h2>
    <span class="big">${(d3.sum(filtered, d => d.amount_twd) / 1e8).toFixed(2)}</span> 億元
  </div>
  <div class="card">
    <h2>受補助者數</h2>
    <span class="big">${new Set(filtered.map(d => d.recipient)).size.toLocaleString()}</span> 個
  </div>
</div>

## 年度補助金額

```js
const byYear = d3.rollups(filtered, v => d3.sum(v, d => d.amount_twd), d => d.fiscal_year)
  .map(([year, total]) => ({year, total})).sort((a, b) => a.year - b.year);
```

```js
Plot.plot({
  width,
  height: 350,
  x: {label: "年度", tickFormat: d => `${d}`},
  y: {label: "金額（億元）", grid: true, transform: d => d / 1e8, tickFormat: d => d.toFixed(1)},
  marks: [
    Plot.barY(byYear, {x: "year", y: "total", fill: c.budget, tip: true}),
    Plot.ruleY([0]),
  ]
})
```

## 各補助業務金額分佈

```js
const byArea = d3.rollups(filtered, v => d3.sum(v, d => d.amount_twd), d => d.subsidy_area)
  .map(([area, total]) => ({area, total}))
  .sort((a, b) => b.total - a.total);
```

```js
Plot.plot({
  width,
  height: 300,
  marginLeft: 120,
  x: {label: "補助總額（元）", grid: true},
  y: {label: null},
  marks: [
    Plot.barX(byArea, {x: "total", y: "area", fill: c.analysis, tip: true, sort: {y: "-x"}}),
    Plot.ruleX([0]),
  ]
})
```

## 補助金額前 20 名受補助者

```js
const topRecipients = d3.rollups(filtered, v => d3.sum(v, d => d.amount_twd), d => d.recipient)
  .map(([name, total]) => ({name, total}))
  .sort((a, b) => b.total - a.total)
  .slice(0, 20);
```

```js
Plot.plot({
  width,
  height: 500,
  marginLeft: 250,
  x: {label: "補助總額（元）", grid: true},
  y: {label: null, domain: topRecipients.map(d => d.name)},
  marks: [
    Plot.barX(topRecipients, {x: "total", y: "name", fill: c.budget, tip: true, sort: {y: "-x"}}),
    Plot.ruleX([0]),
  ]
})
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
    amount_twd: "金額（元）",
  },
  sort: "amount_twd",
  reverse: true,
  rows: 20,
})
```
