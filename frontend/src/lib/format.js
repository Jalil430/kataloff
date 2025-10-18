// форматирование числа в рубли (например: 120000 → 120 000 ₽)
export function fmtRub(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(num);
}

