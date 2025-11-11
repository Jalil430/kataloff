export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const toNumber = (v) => {
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const fmtRub = (n) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  ) + " ₽";
