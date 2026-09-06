// ================================================================
// pop/sub Lab — 編輯式圖表設計系統（Design Token Reader）
// ================================================================
// 與 src/styles.css 的 CSS 變數同源。JS 端保留一份常數是因為
// Observable Plot 的 mark 需要具體色值，無法直接吃 var()。
//
// 視覺風格參考 lieflat-charts（PolyForm Noncommercial 1.0.0）之
// 設計語言，色票已自行微調，未使用其任何程式碼。
//
// 設計原則：
//   1. 明度即資料 — 最重要者最深（暗底時最亮）
//   2. 全站僅鎖一套彩色（porcelain 青瓷藍系），mono 灰階 ladder 為底
//   3. 柱狀圖不斷軸：一律 domain 從 0 起算
//   4. 面積編碼一律開根號（psSqrtR）
//
// 用法：
//   import { psTokens, psPlot, psCard, psSub, psSrc } from "./components/theme.js";
//   const t = psTokens(dark);
//   psCard({title, sub, source}, Plot.plot(psPlot(t, {...})))
// ================================================================

const LIGHT = {
  dark: false,
  ink: "#1b1b19",
  paper: "#f1f0ec",
  muted: "#8d8c86",
  faint: "#c4c3bd",
  grid: "#dfded7",
  // 7 階灰 ladder：依重要性由深到淺
  ladder: ["#1b1b19", "#494843", "#696862", "#8d8c86", "#afaea8", "#c4c3bd", "#d9d8d2"],
  // porcelain 青瓷藍：單色相明度階，供有序資料
  data: "#2f4c9e",
  hero: "#0b2560",
  ramp: ["#d6e6f7", "#a9c6ea", "#7ba3da", "#4e7fc6", "#2f4c9e", "#1a356f", "#0b2560"],
};

const DARK = {
  dark: true,
  ink: "#ecebe5",
  paper: "#1b1b19",
  muted: "#8d8c86",
  faint: "#55544f",
  grid: "#2f2e2a",
  ladder: ["#ecebe5", "#c9c8c2", "#aaa9a3", "#8d8c86", "#6e6d67", "#55544f", "#3d3c38"],
  data: "#7ba3da",
  hero: "#c9def4",
  ramp: ["#1a356f", "#2f4c9e", "#4e7fc6", "#7ba3da", "#a9c6ea", "#c9def4", "#e4effa"],
};

/** 取得當前主題的完整角色色票。 */
export function psTokens(isDark) {
  return isDark ? DARK : LIGHT;
}

/**
 * 相容別名：既有頁面以 budget / settlement / analysis / accent 取色。
 * 全站鎖 porcelain 一套，因此 settlement 改走 mono ladder 而非另一色相。
 */
export function psColors(isDark) {
  const t = psTokens(isDark);
  return {
    budget: t.data,
    settlement: t.ladder[1],
    analysis: t.ramp[2],
    accent: t.hero,
  };
}

/** 字族：Inter 管拉丁與數字，Noto Sans TC 管漢字。 */
export const PS_FONT = 'Inter, "Noto Sans TC", system-ui, -apple-system, sans-serif';

/** 線條語言：發絲線（Lupi）與粗形狀（Glance）。 */
export const PS_STROKE = {
  hairline: 0.8,
  leader: 0.65,
  grid: 0.9,
  shape: 2.2,
};

/** 格線與輔助線的短虛線節奏。 */
export const PS_DASH = "2 4";

/** 膠囊圓角：近似全圓。 */
export const PS_CAPSULE = 99;

/** 面積編碼一律開根號，數值不得直接當半徑。 */
export const psSqrtR = { type: "sqrt", range: [2.5, 13] };

/**
 * Plot 共用預設值。回傳 options 物件供 Plot.plot() 展開，
 * 不在此處呼叫 Plot，避免元件層重複載入圖表庫。
 */
export function psPlot(t, options = {}) {
  const { x = {}, y = {}, fx, fy, style, ...rest } = options;
  const base = {
    marginTop: 18,
    marginRight: 28,
    marginBottom: 34,
    marginLeft: 52,
    style: {
      fontFamily: PS_FONT,
      fontSize: "9.5px",
      background: "transparent",
      color: t.ink,
      overflow: "visible",
      ...style,
    },
    ...rest,
    x: { tickSize: 0, tickPadding: 6, ...x },
    y: { tickSize: 0, tickPadding: 6, ...y },
  };
  if (fx) base.fx = fx;
  if (fy) base.fy = fy;
  return base;
}

/** 極淡虛線格線的共用參數（傳給 Plot.gridX / Plot.gridY）。 */
export function psGrid(t, options = {}) {
  return {
    stroke: t.grid,
    strokeOpacity: 1,
    strokeWidth: PS_STROKE.grid,
    strokeDasharray: PS_DASH,
    ...options,
  };
}

/** 數值標籤：一律最粗，直接貼在資料點旁。 */
export function psValueLabel(t, options = {}) {
  return {
    fontSize: 9.5,
    fontWeight: 800,
    fill: t.ink,
    ...options,
  };
}

/* ================================================================
   卡片四件套：結論式標題 → 副標 → 圖本體 → 全大寫來源行
   ================================================================ */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/**
 * 包出一張卡。標題請寫判斷、不寫圖型名。
 * @param {{title: string, sub?: string, source?: string}} meta
 * @param {Node} figure Plot.plot() 的回傳節點
 */
export function psCard(meta, figure) {
  const card = el("figure", "ps-card");
  card.appendChild(el("h2", "ps-title", meta.title));
  if (meta.sub) card.appendChild(el("p", "ps-sub", meta.sub));
  const body = el("div", "ps-figure");
  body.appendChild(figure);
  card.appendChild(body);
  if (meta.source) {
    card.appendChild(el("figcaption", "ps-src", String(meta.source).toUpperCase()));
  }
  return card;
}

/** 副標題慣例：圖例與時間範圍以「·」分隔。 */
export function psSub(...parts) {
  return parts.filter(Boolean).join(" · ");
}

/** 來源行慣例：全大寫由 CSS 與 psCard 負責，此處僅組字串。 */
export function psSrc(...parts) {
  return parts.filter(Boolean).join(" / ");
}

/** 圖例：實心方塊或虛線，對應 mark 的實際樣式。 */
export function psLegend(items) {
  const wrap = el("div", "ps-legend");
  for (const item of items) {
    const span = el("span");
    const swatch = el("i", item.dash ? "ps-swatch is-dash" : "ps-swatch");
    swatch.style.color = item.color;
    swatch.style.background = item.dash ? "transparent" : item.color;
    span.appendChild(swatch);
    span.appendChild(document.createTextNode(item.label));
    wrap.appendChild(span);
  }
  return wrap;
}

/* ================================================================
   數值格式（臺灣繁體中文語境）
   ================================================================ */

/** 元 → 億元，固定兩位小數。 */
export const toOku = (v) => (v || 0) / 1e8;

/** 千分位整數。 */
export const fmtInt = (v) => Math.round(v || 0).toLocaleString("zh-TW");
