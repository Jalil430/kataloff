// Базовый URL API (меняй при деплое)
const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Отправка данных для расчёта на бэкенд (POST /api/calc)
 */
export async function sendCalc(payload) {
  const res = await fetch(`${API_BASE}/api/calc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ошибка ${res.status}`);
  }

  return res.json();
}

/**
 * Получение WhatsApp-номера продавца (GET /api/number)
 */
export async function getWhatsAppNumber() {
  const res = await fetch(`${API_BASE}/api/number`);
  if (!res.ok) throw new Error("Ошибка получения номера WhatsApp");
  const json = await res.json();
  return json.number;
}
