import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { sendCalc, getWhatsAppNumber } from "../lib/api.js";
import ModalForm from "./ModalForm.jsx";

/** ===== палитра ===== */
const SBER_BLUE = "#0B5CD5";
const SBER_BLUE_HOVER = "#0A4FB6";
const BANK_GREEN = "#2E7D32";

/** ===== утилиты ===== */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const toNumber = (v) => {
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const fmtRub = (n) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  ) + " ₽";

/** ======================= КАЛЬКУЛЯТОР ======================= */
export default function Calculator() {
  /* переключатели */
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [hasDown, setHasDown] = useState(false);

  /* динамический потолок цены */
  const maxPrice = useMemo(() => {
    if (hasGuarantor && hasDown) return 150_000;
    if (hasGuarantor) return 100_000;
    return 70_000;
  }, [hasGuarantor, hasDown]);

  /* стоимость */
  const [priceInput, setPriceInput] = useState("50 000");
  const [price, setPrice] = useState(50_000);

  /* срок */
  const [term, setTerm] = useState(3);
  const maxTerm = hasGuarantor ? 10 : 8;

  /* первый взнос */
  const [downInput, setDownInput] = useState("0");
  const [downPayment, setDownPayment] = useState(0);
  const [downPercent, setDownPercent] = useState(0);

  /* расчёт/WA */
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [wa, setWa] = useState("");
  const lastReqId = useRef(0);

  /* модалка «Оформить» */
  const [modalOpen, setModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [productName, setProductName] = useState("");

  /** ===== загрузка WA ===== */
  useEffect(() => {
    getWhatsAppNumber().then(setWa).catch(() => {});
  }, []);

  /** ===== проценты взноса (живые) ===== */
  useEffect(() => {
    if (!hasDown || price <= 0) setDownPercent(0);
    else setDownPercent(clamp(Math.round((downPayment / price) * 100), 0, 100));
  }, [hasDown, price, downPayment]);

  /** ===== авто-коррекция ограничений ===== */
  useEffect(() => {
    if (price > maxPrice) {
      setPrice(maxPrice);
      setPriceInput(new Intl.NumberFormat("ru-RU").format(maxPrice));
    }
    if (downPayment > price) {
      setDownPayment(price);
      setDownInput(String(price));
    }
    if (term > maxTerm) setTerm(maxTerm);
  }, [maxPrice, maxTerm, price, downPayment, term]);

  /** ===== обработчики ===== */
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

  /** ===== запрос расчёта (анти-гонки) ===== */
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

  useEffect(() => { doCalc(); }, [doCalc]);

  /** ===== вычисления для карточки ===== */
  const monthlyOverpay = useMemo(() => {
    if (!data) return 0;
    const principal = price - (hasDown ? downPayment : 0);
    const diff = Number(data.total) - principal;
    return diff / (term || 1);
  }, [data, price, downPayment, hasDown, term]);

  /** ===== отправка WA ===== */
  const sendWA = () => {
    if (!data) return alert("Сначала рассчитайте рассрочку");
    if (!clientName || !productName) return alert("Введите данные в форме заявки");
    const msg = [
      "🛍️ *Новая заявка на рассрочку*",
      `👤 *Имя клиента:* ${clientName}`,
      `📦 *Товар:* ${productName}`,
      `💰 *Стоимость:* ${fmtRub(price)}`,
      `💳 *Первоначальный взнос:* ${hasDown ? fmtRub(downPayment) : "Нет"}`,
      `📆 *Срок:* ${term} мес.`,
      `🤝 *Поручитель:* ${hasGuarantor ? "Есть" : "Нет"}`,
      "",
      `📈 *Наценка за срок:* ${data.effectiveRate}%`,
      `💵 *Ежемесячный платёж:* ${fmtRub(data.monthlyPayment)}`,
      `💼 *Итоговая сумма:* ${fmtRub(data.total)}`,
    ].join("\n");
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* локальные стили под «сберовские» ползунки и «пилюли» */}
      <style>{`
        .sber-range {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          background: #e5e7eb; /* трек */
          outline: none;
          position: relative;
        }
        .sber-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px; height: 18px;
          border-radius: 9999px;
          background: ${BANK_GREEN};
          border: 3px solid white;
          box-shadow: 0 0 0 2px ${BANK_GREEN};
          cursor: pointer;
          margin-top: -5px;
          position: relative;
        }
        .sber-range::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 9999px;
          background: ${BANK_GREEN};
          border: 3px solid white;
          box-shadow: 0 0 0 2px ${BANK_GREEN};
          cursor: pointer;
        }
        /* риски на шкале (через градиент) */
        .sber-range.marks-4 { background-image:
          linear-gradient(#e5e7eb,#e5e7eb),
          repeating-linear-gradient(to right, transparent, transparent calc(25% - 1px), #d1d5db 0, #d1d5db calc(25% + 1px));
          background-size: 100% 8px, 100% 2px;
          background-position: 0 0, 0 6px;
          background-repeat: no-repeat;
        }
        .pill {
          background: #f4f6f8;
          border: 1px solid #d6dbe0;
          border-radius: 14px;
          padding: 10px 14px;
          min-width: 130px;
          text-align: center;
          font-weight: 600;
          color: #223042;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* заголовок + лимиты */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: "#223042" }}>
            Калькулятор рассрочки
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Без поручителя — до <b>70 000 ₽</b>. С поручителем — до <b>100 000 ₽</b>.
            С поручителем и первым взносом — до <b>150 000 ₽</b>.
          </p>
        </div>

        {/* две колонки: слева контролы, справа карточка */}
        <div className="grid md:grid-cols-[1fr_420px] gap-8">
          {/* левая часть (как у Сбера) */}
          <div className="space-y-10">
            {/* Стоимость */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#223042]">Стоимость имущества</h3>
                <div className="pill">{fmtRub(price)}</div>
              </div>

              <input
                className="sber-range marks-4"
                type="range"
                min={0}
                max={maxPrice}
                step={1000}
                value={clamp(price, 0, maxPrice)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setPrice(n);
                  setPriceInput(new Intl.NumberFormat("ru-RU").format(n));
                }}
              />

              {/* подписи шкалы (как у сбер-скрина, но под наши лимиты) */}
              <div className="flex justify-between text-gray-500 mt-2 text-sm">
                <span>0 ₽</span>
                <span>{fmtRub(Math.round(maxPrice * 0.25))}</span>
                <span>{fmtRub(Math.round(maxPrice * 0.5))}</span>
                <span>{fmtRub(Math.round(maxPrice * 0.75))}</span>
                <span>{fmtRub(maxPrice)}</span>
              </div>
            </section>

            {/* Первый взнос */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#223042]">Первоначальный взнос</h3>

                <div className="flex items-center gap-3">
                  {/* сумма */}
                  <div className="pill">{hasDown ? fmtRub(downPayment) : "0 ₽"}</div>
                  {/* проценты */}
                  <div className="pill" style={{ minWidth: 90 }}>{hasDown ? `${downPercent}%` : "0%"}</div>
                </div>
              </div>

              {/* переключатель «Есть первый взнос?» */}
              <div className="mb-4">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasDown}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setHasDown(v);
                      if (v && (downInput.trim() === "" || Number.isNaN(toNumber(downInput)))) {
                        setDownInput("0");
                        setDownPayment(0);
                      }
                    }}
                    className="w-5 h-5"
                    style={{ accentColor: BANK_GREEN }}
                  />
                  <span className="text-[#223042] font-medium">Есть первый взнос</span>
                </label>
              </div>

              {/* слайдер взноса (только если включен) */}
              <input
                className="sber-range marks-4"
                type="range"
                min={0}
                max={price}
                step={500}
                value={hasDown ? clamp(downPayment, 0, price) : 0}
                onChange={(e) => onDownRange(e.target.value)}
                disabled={!hasDown}
              />
              <div className="flex justify-between text-gray-500 mt-2 text-sm">
                <span>0 %</span>
                <span>25 %</span>
                <span>50 %</span>
                <span>75 %</span>
                <span>{price > 0 ? `${clamp(Math.round((price / price) * 49), 0, 49)} %` : "49 %"}</span>
              </div>
            </section>

            {/* Срок договора */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#223042]">Срок договора</h3>
                <div className="pill" style={{ minWidth: 150 }}>{term} месяцев</div>
              </div>

              <input
                className="sber-range marks-4"
                type="range"
                min={3}
                max={maxTerm}
                step={1}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
              />
              <div className="flex justify-between text-gray-500 mt-2 text-sm">
                <span>3 мес.</span>
                <span>{Math.round(3 + (maxTerm - 3) * 0.25)} мес.</span>
                <span>{Math.round(3 + (maxTerm - 3) * 0.5)} мес.</span>
                <span>{Math.round(3 + (maxTerm - 3) * 0.75)} мес.</span>
                <span>{maxTerm} мес.</span>
              </div>
            </section>

            {/* Поручитель */}
            <section>
              <label className="inline-flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={hasGuarantor}
                  onChange={(e) => setHasGuarantor(e.target.checked)}
                  className="w-5 h-5"
                  style={{ accentColor: BANK_GREEN }}
                />
                <span className="text-[#223042] font-medium">Есть поручитель</span>
              </label>
            </section>
          </div>

          {/* правая карточка с расчётом */}
          <aside className="md:sticky md:top-6 h-fit">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-gray-500 text-sm mb-2">Ежемесячный платёж:</div>
              <div className="text-4xl md:text-5xl font-bold mb-4 text-[#223042]">
                {data ? fmtRub(data.monthlyPayment) : "—"}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <InfoRow label="Итоговая сумма" value={data ? fmtRub(data.total) : "—"} />
                <InfoRow label="Наценка за срок" value={data ? `${data.effectiveRate}%` : "—"} />
                <InfoRow label="Переплата в месяц" value={data ? fmtRub(monthlyOverpay) : "—"} />
                <InfoRow label="Доступный максимум" value={fmtRub(maxPrice)} />
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="w-full rounded-full py-3 text-white font-semibold transition shadow-sm"
                style={{ background: SBER_BLUE }}
                onMouseOver={(e) => (e.currentTarget.style.background = SBER_BLUE_HOVER)}
                onMouseOut={(e) => (e.currentTarget.style.background = SBER_BLUE)}
              >
                Оформить заявку
              </button>

              <p className="text-[12px] text-gray-500 mt-4 leading-snug">
                Для дополниетльных впорососв свяжитесь с нашим менеджером в WhatsApp.
              </p>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </aside>
        </div>
      </div>

      {/* модалка */}
      {modalOpen && (
        <ModalForm
          onClose={() => setModalOpen(false)}
          clientName={clientName}
          setClientName={setClientName}
          productName={productName}
          setProductName={setProductName}
          onSubmit={sendWA}
        />
      )}
    </div>
  );
}

/** ===== вспомогательные ===== */
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-[#223042]">{value}</span>
    </div>
  );
}
