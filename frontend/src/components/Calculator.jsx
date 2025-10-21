import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { sendCalc, getWhatsAppNumber } from "../lib/api.js";
import StatCard from "./StatCard.jsx";

/* ====== палитра ====== */
const BANK_GREEN = "#2E7D32";
const BANK_GREEN_DARK = "#256628";

/* ====== утилиты ====== */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const toNumber = (v) => {
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const fmtRub = (n) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  ) + " ₽";

/* ======================= КАЛЬКУЛЯТОР ======================= */
export default function Calculator() {
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [hasDown, setHasDown] = useState(false);

  // динамический максимум
  const maxPrice = useMemo(() => {
    if (hasGuarantor && hasDown) return 150_000;
    if (hasGuarantor) return 100_000;
    return 70_000;
  }, [hasGuarantor, hasDown]);

  const [priceInput, setPriceInput] = useState("50 000");
  const [price, setPrice] = useState(50_000);

  const [term, setTerm] = useState(3);
  const maxTerm = hasGuarantor ? 10 : 8;

  const [downInput, setDownInput] = useState("0");
  const [downPayment, setDownPayment] = useState(0);
  const [downPercent, setDownPercent] = useState(0);

  const [clientName, setClientName] = useState("");
  const [productName, setProductName] = useState("");
  const [wa, setWa] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const lastReqId = useRef(0);

  /* ====== Загрузка номера WhatsApp ====== */
  useEffect(() => {
    getWhatsAppNumber().then(setWa).catch(() => {});
  }, []);

  /* ====== Пересчёт процентов ====== */
  useEffect(() => {
    if (!hasDown || price <= 0) setDownPercent(0);
    else setDownPercent(clamp(Math.round((downPayment / price) * 100), 0, 100));
  }, [hasDown, price, downPayment]);

  /* ====== Коррекция цены и взноса при изменении статусов ====== */
  useEffect(() => {
    if (price > maxPrice) {
      setPrice(maxPrice);
      setPriceInput(fmtRub(maxPrice).replace(" ₽", ""));
    }
    if (downPayment > price) {
      setDownPayment(price);
      setDownInput(price.toString());
    }
    if (term > maxTerm) setTerm(maxTerm);
  }, [maxPrice, price, term, downPayment, maxTerm]);

  /* ====== Обработчики ====== */
  const onPriceInput = (val) => {
    setPriceInput(val);
    const n = clamp(toNumber(val), 0, maxPrice);
    setPrice(n);
  };

  const onDownInput = (val) => {
    const n = clamp(toNumber(val), 0, price);
    setDownInput(n.toString());
    setDownPayment(n);
  };

  const onDownRange = (n) => {
    const num = clamp(Number(n), 0, price);
    setDownPayment(num);
    setDownInput(num.toString());
  };

  /* ====== Расчёт ====== */
  const doCalc = useCallback(async () => {
    const reqId = ++lastReqId.current;
    setError("");
    try {
      const payload = {
        productName,
        price,
        term,
        hasGuarantor,
        hasDown,
        downPercent,
      };
      const res = await sendCalc(payload);
      if (reqId === lastReqId.current) setData(res);
    } catch (e) {
      if (reqId === lastReqId.current) {
        setError(e?.message || "Ошибка расчёта");
        setData(null);
      }
    }
  }, [productName, price, term, hasGuarantor, hasDown, downPercent]);

  useEffect(() => {
    doCalc();
  }, [doCalc]);

  /* ====== Отправка в WA ====== */
  const sendWA = () => {
    if (!data) return alert("Сначала рассчитайте рассрочку");
    if (!clientName || !productName) return alert("Введите имя и товар");
    const msg = [
      "🛍️ *Новая заявка на рассрочку*",
      `👤 *Имя клиента:* ${clientName}`,
      `📦 *Товар:* ${productName}`,
      `💰 *Стоимость:* ${fmtRub(price)}`,
      `💳 *Первоначальный взнос:* ${hasDown ? fmtRub(downPayment) : "Нет"}`,
      `📆 *Срок:* ${term} мес.`,
      `🤝 *Поручитель:* ${hasGuarantor ? "Есть" : "Нет"}`,
      "",
      `📈 *Наценка за весь срок:* ${data.effectiveRate}%`,
      `💵 *Ежемесячный платёж:* ${fmtRub(data.monthlyPayment)}`,
      `💼 *Итоговая сумма:* ${fmtRub(data.total)}`,
    ].join("\n");
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  /* ====== Переплата ====== */
  const monthlyOverpay = useMemo(() => {
    if (!data) return 0;
    const principal = price - (hasDown ? downPayment : 0);
    const diff = Number(data.total) - principal;
    return diff / (term || 1);
  }, [data, price, downPayment, hasDown, term]);

  /* ====== UI ====== */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28 sm:pb-10 relative">
      <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
        <h1 className="text-3xl font-bold text-center mb-4" style={{ color: BANK_GREEN }}>
          Калькулятор рассрочки
        </h1>

        {/* Поручитель — теперь вверху */}
        <div className="mb-6">
          <RowSwitch
            label="Есть поручитель?"
            checked={hasGuarantor}
            onChange={setHasGuarantor}
          />
        </div>

        {/* Описание лимитов */}
        <p className="text-sm text-center text-gray-600 mb-8">
          💡 Без поручителя — до <b>70 000 ₽</b>. С поручителем — до <b>100 000 ₽</b>.{" "}
          С поручителем и первым взносом — до <b>150 000 ₽</b>.
        </p>

        <div className="space-y-5">
          {/* стоимость */}
          <FieldCard>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Стоимость товара
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                inputMode="numeric"
                type="text"
                value={priceInput}
                onChange={(e) => onPriceInput(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2"
                style={{ outline: "none", caretColor: BANK_GREEN }}
              />
              <span className="text-gray-700 font-semibold">₽</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={1000}
              value={clamp(price, 0, maxPrice)}
              onChange={(e) => {
                const n = Number(e.target.value);
                setPrice(n);
                setPriceInput(n.toString());
              }}
              className="w-full"
              style={{ accentColor: BANK_GREEN }}
            />
            <ScaleFooter left="0 ₽" right={fmtRub(maxPrice)} />
          </FieldCard>

          {/* первый взнос */}
          <RowSwitch
            label="Есть первый взнос?"
            checked={hasDown}
            onChange={(v) => {
              setHasDown(v);
              if (v && (downInput.trim() === "" || isNaN(toNumber(downInput)))) {
                setDownInput("0");
                setDownPayment(0);
              }
            }}
          />

          {hasDown && (
            <FieldCard>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Первоначальный взнос (до {fmtRub(price)})
              </label>
              <div className="flex gap-3 items-center mb-3">
                <input
                  inputMode="numeric"
                  type="text"
                  value={downInput}
                  onChange={(e) => onDownInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2"
                  style={{ outline: "none", caretColor: BANK_GREEN }}
                />
                <span className="text-gray-700 font-semibold">₽</span>
                <span
                  className="px-3 py-1 rounded-lg text-sm font-semibold min-w-[48px] text-center"
                  style={{ background: "#E8F5E9", color: BANK_GREEN }}
                >
                  {downPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={price}
                step={500}
                value={clamp(downPayment, 0, price)}
                onChange={(e) => onDownRange(e.target.value)}
                className="w-full"
                style={{ accentColor: BANK_GREEN }}
              />
              <ScaleFooter left="0 ₽" right={fmtRub(price)} />
            </FieldCard>
          )}

          {/* срок */}
          <FieldCard>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Срок рассрочки
            </label>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-lg font-semibold">{term} мес.</span>
            </div>
            <input
              type="range"
              min={3}
              max={maxTerm}
              step={1}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: BANK_GREEN }}
            />
            <ScaleFooter left="3 мес." right={`${maxTerm} мес.`} />
          </FieldCard>

          {/* данные клиента */}
          <TextField
            label="Имя клиента"
            value={clientName}
            onChange={setClientName}
            placeholder="Введите ФИО"
          />
          <TextField
            label="Название товара"
            value={productName}
            onChange={setProductName}
            placeholder="Например: iPhone 15"
          />
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {data && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Ежемесячный платёж" value={fmtRub(data.monthlyPayment)} />
            <StatCard title="Наценка за срок" value={`${data.effectiveRate}%`} />
            <StatCard title="Итоговая сумма" value={fmtRub(data.total)} />
            <StatCard title="Переплата в месяц" value={fmtRub(monthlyOverpay)} />
          </div>
        )}

        <button
          onClick={sendWA}
          className="w-full mt-8 py-4 rounded-2xl text-white text-lg font-semibold shadow-lg transition"
          style={{ background: BANK_GREEN }}
          onMouseOver={(e) => (e.currentTarget.style.background = BANK_GREEN_DARK)}
          onMouseOut={(e) => (e.currentTarget.style.background = BANK_GREEN)}
        >
          📲 Отправить в WhatsApp
        </button>
      </div>

      {/* нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 shadow-lg sm:hidden">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex flex-col items-center font-semibold text-sm"
          style={{ color: BANK_GREEN }}
        >
          <span className="text-xl">←</span>
          Назад
        </button>
        <button
          onClick={() => (window.location.href = "/check")}
          className="flex flex-col items-center font-semibold text-sm"
          style={{ color: BANK_GREEN }}
        >
          <span className="text-xl">📄</span>
          Мои рассрочки
        </button>
      </div>
    </div>
  );
}

/* ======================= ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ======================= */
function FieldCard({ children }) {
  return <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">{children}</div>;
}

function ScaleFooter({ left, right }) {
  return (
    <div className="flex justify-between text-xs text-gray-500 mt-1">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function RowSwitch({ label, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
      style={{ borderColor: "#d1d5db" }}
    >
      <span className="text-gray-800 font-medium">{label}</span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-6 h-6 cursor-pointer"
        style={{ accentColor: BANK_GREEN }}
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <FieldCard>
      <label className="block text-sm text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2"
        style={{ outline: "none", caretColor: BANK_GREEN }}
      />
    </FieldCard>
  );
}
