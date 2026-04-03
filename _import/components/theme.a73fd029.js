// pop/sub Lab — Design Token Reader
// 使用 Observable 內建 dark 變數來決定色彩
// 用法：
//   import { psColors } from "./components/theme.js";
//   const c = psColors(dark);
//   Plot.barY(data, { fill: c.budget })

export function psColors(isDark) {
  if (isDark) {
    return {
      budget:     "#60a5fa",
      settlement: "#f87171",
      analysis:   "#a5b4fc",
      accent:     "#34d399",
    };
  }
  return {
    budget:     "#2563eb",
    settlement: "#dc2626",
    analysis:   "#6366f1",
    accent:     "#059669",
  };
}
