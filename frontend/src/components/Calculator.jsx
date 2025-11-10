import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { sendCalc, getWhatsAppNumber } from "../lib/api.js";
import ModalForm from "./ModalForm.jsx";
import ContactSection from "./ContactSection.jsx";

/** ===== палитра ===== */
const LOGO_BLUE = "#1A3A5C";
const LOGO_BLUE_HOVER = "#14304A";
const LOGO_GREEN = "#4A9B7E";
const INFO_BLUE = "#42A5F5";
const INFO_BLUE_BG = "#E3F2FD";

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
  const [price, setPrice] = useState(50_000);
  const [priceInputValue, setPriceInputValue] = useState("50 000");

  /* срок */
  const [term, setTerm] = useState(3);
  const [termInputValue, setTermInputValue] = useState("3");
  const maxTerm = hasGuarantor ? 10 : 8;

  /* первый взнос */
  const [downPayment, setDownPayment] = useState(0);
  const [downInputValue, setDownInputValue] = useState("0");
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
    if (!hasDown || price <= 0) {
      setDownPercent(0);
    } else {
      setDownPercent(clamp(Math.round((downPayment / price) * 100), 0, 100));
    }
  }, [hasDown, price, downPayment]);

  /** ===== авто-коррекция ограничений ===== */
  useEffect(() => {
    if (price > maxPrice) {
      setPrice(maxPrice);
      setPriceInputValue(new Intl.NumberFormat("ru-RU").format(maxPrice));
    }
    if (downPayment > price) {
      setDownPayment(price);
      setDownInputValue(new Intl.NumberFormat("ru-RU").format(price));
    }
    if (term > maxTerm) {
      setTerm(maxTerm);
      setTermInputValue(maxTerm.toString());
    }
  }, [maxPrice, maxTerm, price, downPayment, term]);

  /** ===== обработчики ===== */
  const handlePriceInput = (val) => {
    // Only allow numbers and spaces, show "0" if empty
    const cleanVal = val.replace(/[^0-9\s]/g, '');
    const displayVal = cleanVal === '' ? '0' : cleanVal;
    setPriceInputValue(displayVal);

    const numericValue = toNumber(displayVal);
    if (numericValue >= 0) {
      setPrice(numericValue);
    }
  };

  const handlePriceSlider = (val) => {
    const n = Number(val);
    setPrice(n);
    setPriceInputValue(new Intl.NumberFormat("ru-RU").format(n));
  };

  const updateSliderFill = (slider, value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, ${LOGO_GREEN} 0%, ${LOGO_GREEN} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
  };

  const handleDownInput = (val) => {
    const cleanVal = val.replace(/[^0-9\s]/g, '');
    const displayVal = cleanVal === '' ? '0' : cleanVal;
    setDownInputValue(displayVal);

    const numericValue = toNumber(displayVal);
    if (numericValue >= 0) {
      setDownPayment(numericValue);
    }
  };

  const handleDownSlider = (val) => {
    const minDown = 3000; // фиксированный минимум для ползунка
    const n = clamp(Number(val), minDown, price);
    setDownPayment(n);
    setDownInputValue(new Intl.NumberFormat("ru-RU").format(n));
  };

  const handleDownPercentInput = (val) => {
    const numericValue = Number(val) || 0;
    if (numericValue >= 0) {
      const rubleValue = Math.round((price * numericValue) / 100);
      setDownPayment(rubleValue);
      setDownInputValue(new Intl.NumberFormat("ru-RU").format(rubleValue));
    }
  };

  const handleTermInput = (val) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const displayVal = cleanVal === '' ? '0' : cleanVal;
    setTermInputValue(displayVal);
  };

  const handleTermSlider = (val) => {
    const termValue = Number(val);
    setTerm(termValue);
    setTermInputValue(termValue.toString());
  };

  const handleGuarantorChange = (checked) => {
    setHasGuarantor(checked);
  };

  // включение/выключение первого взноса: старт 2000 ₽, минимум 3000 ₽ для ограничений
  const handleDownToggle = (checked) => {
    setHasDown(checked);
    if (!checked) {
      setDownPayment(0);
      setDownInputValue("0");
    } else {
      const startDown = 2000;
      setDownPayment(startDown);
      setDownInputValue(new Intl.NumberFormat("ru-RU").format(startDown));
    }
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
      if (reqId === lastReqId.current) {
        setData(res);
      }
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

  /** ===== инициализация слайдеров ===== */
  useEffect(() => {
    const sliders = document.querySelectorAll('.sber-range');
    sliders.forEach(slider => {
      const value = slider.value;
      const min = slider.min;
      const max = slider.max;
      updateSliderFill(slider, value, min, max);
    });
  }, [price, term, downPayment, maxPrice, maxTerm]);

/** ===== НОВЫЕ РАСЧЁТЫ ПО МУРАБАХЕ (с округлением и пересчётом реальной наценки) ===== */
const ratePct = useMemo(() => {
  const raw = Number(data?.effectiveRate);
  return Number.isFinite(raw) ? raw : 0;
}, [data]);

// Наценка (из бэкенда)
const totalWithMarkup = useMemo(() => {
  const markup = Math.round((price * ratePct) / 100);
  return price + markup;
}, [price, ratePct]);

// Сумма к финансированию
const financedAmount = useMemo(() => {
  const dp = hasDown ? downPayment : 0;
  return Math.max(0, totalWithMarkup - dp);
}, [totalWithMarkup, hasDown, downPayment]);

// Округляем ежемесячный платёж и помечаем, если была корректировка
const [wasRounded, setWasRounded] = useState(false);

const monthlyPaymentCalc = useMemo(() => {
  const months = term || 1;
  if (months <= 0) return 0;

  const raw = financedAmount / months;
  let rounded = raw;

  // Округляем до ближайших 50 ₽
  const remainder = raw % 100;

  if (remainder < 25) {
    rounded = raw - remainder; // вниз (пример: 2766 → 2750)
  } else if (remainder >= 75) {
    rounded = raw - remainder + 100; // вверх (пример: 2785 → 2800)
  } else {
    rounded = raw - remainder + 50; // середина — до 50
  }

  if (Math.round(rounded) !== Math.round(raw)) {
    setWasRounded(true);
  } else {
    setWasRounded(false);
  }

  return Math.round(rounded);
}, [financedAmount, term]);

// Пересчитанная общая сумма (наценка фактически изменилась)
const totalWithMarkupRounded = useMemo(() => {
  const dp = hasDown ? downPayment : 0;
  return Math.round(monthlyPaymentCalc * term + dp);
}, [monthlyPaymentCalc, term, hasDown, downPayment]);

// Новая "реальная" общая наценка и ставка
const realMarkupRub = useMemo(() => {
  return totalWithMarkupRounded - price;
}, [totalWithMarkupRounded, price]);

const realMarkupPct = useMemo(() => {
  if (!price) return 0;
  return ((realMarkupRub / price) * 100).toFixed(2);
}, [realMarkupRub, price]);

// Новая наценка в месяц
const monthlyMarkupRub = useMemo(() => {
  const months = term || 1;
  return Math.round(realMarkupRub / months);
}, [realMarkupRub, term]);

  /** ===== отправка WA ===== */
/** ===== отправка WA ===== */
const sendWA = () => {
  if (!data) return alert("Сначала рассчитайте рассрочку");
  if (!clientName || !productName) return alert("Введите данные в форме заявки");

  const msg = [
    "*Новая заявка на рассрочку*",
    `*Имя клиента:* ${clientName}`,
    `*Товар:* ${productName}`,
    `*Стоимость товара:* ${fmtRub(price)}`,
    `*Первоначальный взнос:* ${hasDown ? fmtRub(downPayment) : "Нет"}`,
    `*Срок:* ${term} мес.`,
    `*Поручитель:* ${hasGuarantor ? "Есть" : "Нет"}`,
    "",
    `*Ежемесячный платёж:* ${fmtRub(monthlyPaymentCalc)}`,
    `*Общая сумма рассрочки:* ${fmtRub(totalWithMarkupRounded)}`
  ]
    .filter(Boolean)
    .join("\n");

  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
  setModalOpen(false);
};

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6f7fb]">
      <style>{`
        .sber-range {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          background: #e5e7eb;
          outline: none;
          position: relative;
        }

        .sber-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${LOGO_GREEN};
          border: 3px solid white;
          box-shadow: 0 0 0 1px ${LOGO_GREEN};
          cursor: pointer;
          position: relative;
        }
        .sber-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${LOGO_GREEN};
          border: 3px solid white;
          box-shadow: 0 0 0 1px ${LOGO_GREEN};
          cursor: pointer;
          transform: translateY(-50%);
        }
        .sber-range.marks-4 {
          background-image:
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
        .pill-input {
          background: #f4f6f8;
          border: 1px solid #d6dbe0;
          border-radius: 14px;
          padding: 10px 14px;
          min-width: 130px;
          text-align: center;
          font-weight: 600;
          color: #223042;
          outline: none;
        }
        .pill-input:focus {
          border-color: ${LOGO_GREEN};
          box-shadow: 0 0 0 2px ${LOGO_GREEN}33;
        }
        .pill-input-percent {
          background: #f4f6f8;
          border: 1px solid #d6dbe0;
          border-radius: 14px;
          padding: 10px 14px;
          text-align: center;
          font-weight: 600;
          color: #223042;
          outline: none;
          -moz-appearance: textfield;
        }
        .pill-input-percent::-webkit-outer-spin-button,
        .pill-input-percent::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .pill-input-percent:focus {
          border-color: ${LOGO_GREEN};
          box-shadow: 0 0 0 2px ${LOGO_GREEN}33;
        }
        .pill-input:disabled,
        .pill-input[readonly] {
          background: #f4f6f8;
          color: #223042;
          cursor: default;
          opacity: 1;
        }
        .pill-input-percent:disabled,
        .pill-input-percent[readonly] {
          background: #f4f6f8;
          color: #223042;
          cursor: default;
          opacity: 1;
        }
        .pill-input-percent-small {
          background: #f4f6f8;
          border: 1px solid #d6dbe0;
          border-radius: 14px;
          padding: 10px 14px;
          min-width: 85px;
          text-align: center;
          font-weight: 600;
          color: #223042;
          outline: none;
          -moz-appearance: textfield;
        }
        .pill-input-percent-small::-webkit-outer-spin-button,
        .pill-input-percent-small::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .pill-input-percent-small:focus {
          border-color: ${LOGO_GREEN};
          box-shadow: 0 0 0 2px ${LOGO_GREEN}33;
        }
        .pill-input-percent-small:disabled,
        .pill-input-percent-small[readonly] {
          background: #f4f6f8;
          color: #223042;
          cursor: default;
          opacity: 1;
        }
        .option-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: white;
          color: ${LOGO_GREEN};
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        .option-button:hover {
          border-color: #d1d5db;
        }
        .option-button.active {
          background: linear-gradient(135deg, ${LOGO_BLUE} 0%, ${LOGO_GREEN} 100%);
          color: white;
          border-color: ${LOGO_GREEN};
        }
        .section-disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .section-disabled .sбер-range::-webkit-slider-thumb {
          opacity: 0.5;
        }
        .section-disabled .sбер-range::-moz-range-thumb {
          opacity: 0.5;
        }
        @media (min-width: 768px) {
          .input-fixed-desktop {
            width: 224px !important;
          }
          .container-fixed-desktop {
            width: 224px !important;
          }
        }
      `}</style>

      <div className="container mx-auto px-6 py-4">
        {/* заголовок */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-3xl font-semibold mb-2" style={{ color: "#223042" }}>
            Калькулятор рассрочки
          </h1>
        </div>

        {/* карточка с подсказкой - только на мобильных */}
        <div className="lg:hidden mb-6">
          <div className="rounded-2xl border p-4" style={{ backgroundColor: INFO_BLUE_BG, borderColor: INFO_BLUE }}>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: INFO_BLUE }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657л-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="text-sm leading-relaxed" style={{ color: INFO_BLUE }}>
                <p>
                  Без поручителя — до <b>70 000 ₽</b><br />
                  С поручителем — до <b>100 000 ₽</b><br />
                  С поручителем и первым взносом — до <b>150 000 ₽</b>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* селекторы опций */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => handleDownToggle(!hasDown)}
            className={`option-button ${hasDown ? 'active' : ''}`}
          >
            <span style={{ fontSize: '20px', fontWeight: '300' }}>₽</span>
            Первый взнос
          </button>
          <button
            onClick={() => handleGuarantorChange(!hasGuarantor)}
            className={`option-button ${hasGuarantor ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Поручитель
          </button>
        </div>

        {/* две колонки: слева контролы, справа карточка */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
          {/* левая часть */}
          <div className="space-y-18">
            {/* Стоимость */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#223042] mb-2 md:mb-0">Стоимость товара</h3>
                <input
                  type="text"
                  value={priceInputValue}
                  onChange={(e) => handlePriceInput(e.target.value)}
                  onBlur={() => {
                    const clampedValue = clamp(toNumber(priceInputValue), 0, maxPrice);
                    const formattedValue = new Intl.NumberFormat("ru-RU").format(clampedValue);
                    setPriceInputValue(formattedValue);
                    setPrice(clampedValue);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const clampedValue = clamp(toNumber(priceInputValue), 0, maxPrice);
                      const formattedValue = new Intl.NumberFormat("ru-RU").format(clampedValue);
                      setPriceInputValue(formattedValue);
                      setPrice(clampedValue);
                      e.target.blur();
                    }
                  }}
                  className="pill-input w-full input-fixed-desktop"
                  placeholder="Введите стоимость"
                />
              </div>

              <div className="mb-4">
                <input
                  className="sber-range marks-4"
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={1000}
                  value={clamp(price, 0, maxPrice)}
                  onChange={(e) => {
                    handlePriceSlider(e.target.value);
                    updateSliderFill(e.target, e.target.value, 0, maxPrice);
                  }}

                />
              </div>

              <div className="relative mx-6 overflow-visible">
                <div className="relative w-full">
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '0%', transform: 'translateX(0%)' }}>0 ₽</span>
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)' }}>{new Intl.NumberFormat("ru-RU").format(Math.round(maxPrice * 0.5))} ₽</span>
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '100%', transform: 'translateX(-100%)' }}>{new Intl.NumberFormat("ru-RU").format(maxPrice)} ₽</span>
                </div>
              </div>
            </section>

            {/* Срок договора */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#223042] mb-2 md:mb-0">Срок рассрочки</h3>
                <input
                  type="number"
                  value={termInputValue}
                  onChange={(e) => handleTermInput(e.target.value)}
                  onBlur={() => {
                    const clampedValue = clamp(Number(termInputValue) || 3, 3, maxTerm);
                    setTerm(clampedValue);
                    setTermInputValue(clampedValue.toString());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const clampedValue = clamp(Number(termInputValue) || 3, 3, maxTerm);
                      setTerm(clampedValue);
                      setTermInputValue(clampedValue.toString());
                      e.target.blur();
                    }
                  }}
                  min={3}
                  max={maxTerm}
                  className="pill-input w-full input-fixed-desktop"
                  placeholder="Срок в месяцах"
                />
              </div>

              <div className="mb-4">
                <input
                  className="sber-range marks-4"
                  type="range"
                  min={3}
                  max={maxTerm}
                  step={1}
                  value={term}
                  onChange={(e) => {
                    handleTermSlider(e.target.value);
                    updateSliderFill(e.target, e.target.value, 3, maxTerm);
                  }}
                />
              </div>

              <div className="relative mx-6 overflow-visible">
                <div className="relative w-full">
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '0%', transform: 'translateX(0%)' }}>3 мес.</span>
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)' }}>{Math.round(3 + (maxTerm - 3) * 0.5)} мес.</span>
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '100%', transform: 'translateX(-100%)' }}>{maxTerm} мес.</span>
                </div>
              </div>
            </section>

            {/* Первый взнос */}
            <section className={`mb-8 ${!hasDown ? 'section-disabled' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#223042] mb-2 md:mb-0">Первоначальный взнос</h3>
                <div className="flex items-center gap-3 w-full container-fixed-desktop">
                  <input
                    type="text"
                    value={hasDown ? downInputValue : "0"}
                    onChange={hasDown ? (e) => handleDownInput(e.target.value) : undefined}
                    onBlur={hasDown ? () => {
                      const minDown = 3000;
                      const clampedValue = clamp(toNumber(downInputValue), minDown, price);
                      const formattedValue = new Intl.NumberFormat("ru-RU").format(clampedValue);
                      setDownInputValue(formattedValue);
                      setDownPayment(clampedValue);
                    } : undefined}
                    onKeyDown={hasDown ? (e) => {
                      if (e.key === 'Enter') {
                        const minDown = 3000;
                        const clampedValue = clamp(toNumber(downInputValue), minDown, price);
                        const formattedValue = new Intl.NumberFormat("ru-RU").format(clampedValue);
                        setDownInputValue(formattedValue);
                        setDownPayment(clampedValue);
                        e.target.blur();
                      }
                    } : undefined}
                    className="pill-input flex-1"
                    style={{ flexBasis: '60%' }}
                    placeholder={hasDown ? "Введите сумму" : "0 ₽"}
                    disabled={!hasDown}
                    readOnly={!hasDown}
                  />
                  <div className="relative flex-1" style={{ flexBasis: '40%' }}>
                    <input
                      type="text"
                      value={hasDown ? downPercent : "0"}
                      onChange={hasDown ? (e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        handleDownPercentInput(val);
                      } : undefined}
                      onBlur={hasDown ? () => {
                        const clampedPercent = clamp(Number(downPercent) || 25, 25, 100);
                        const rubleValue = Math.round((price * clampedPercent) / 100);
                        setDownPayment(rubleValue);
                        setDownInputValue(new Intl.NumberFormat("ru-RU").format(rubleValue));
                      } : undefined}
                      onKeyDown={hasDown ? (e) => {
                        if (e.key === 'Enter') {
                          const clampedPercent = clamp(Number(downPercent) || 25, 25, 100);
                          const rubleValue = Math.round((price * clampedPercent) / 100);
                          setDownPayment(rubleValue);
                          setDownInputValue(new Intl.NumberFormat("ru-RU").format(rubleValue));
                          e.target.blur();
                        }
                      } : undefined}
                      className="pill-input-percent-small w-full"
                      placeholder={hasDown ? "0" : "0"}
                      disabled={!hasDown}
                      readOnly={!hasDown}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#223042] font-semibold pointer-events-none">%</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <input
                  className="sber-range marks-4"
                  type="range"
                  min={3000}
                  max={price}
                  step={500}
                  value={hasDown ? clamp(downPayment, 3000, price) : 3000}
                  onChange={(e) => {
                    handleDownSlider(e.target.value);
                    updateSliderFill(e.target, e.target.value, 3000, price);
                  }}
                  disabled={!hasDown}
                />
              </div>

              <div className="relative mx-6 overflow-visible">
                <div className="relative w-full">
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '0%', transform: 'translateX(0%)' }}>{new Intl.NumberFormat("ru-RU").format(3000)} ₽</span>
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)' }}>{new Intl.NumberFormat("ru-RU").format(Math.round(price * 0.5))} ₽</span>
                  <span className="absolute text-gray-500 text-sm whitespace-nowrap" style={{ left: '100%', transform: 'translateX(-100%)' }}>{new Intl.NumberFormat("ru-RU").format(price)} ₽</span>
                </div>
              </div>
            </section>
          </div>

          {/* правая карточка с расчётом */}
          <aside className="lg:sticky lg:top-4 h-fit space-y-4">
            {/* карточка с подсказкой - только на десктопе */}
            <div className="hidden lg:block rounded-2xl border p-4" style={{ backgroundColor: INFO_BLUE_BG, borderColor: INFO_BLUE }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: INFO_BLUE }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547з" />
                </svg>
                <div className="text-sm leading-relaxed" style={{ color: INFO_BLUE }}>
                  <p>
                    Без поручителя — до <b>70 000 ₽</b><br />
                    С поручителем — до <b>100 000 ₽</b><br />
                    С поручителем и первым взносом — до <b>150 000 ₽</b>
                  </p>
                </div>
              </div>
            </div>

            {/* карточка с расчётом */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="text-gray-500 text-sm mb-2">Ежемесячный платёж:</div>
              <div className="text-3xl lg:text-4xl font-bold mb-4 text-[#223042]">
                {fmtRub(monthlyPaymentCalc)}
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                <InfoRow label="Общая сумма рассрочки:" value={fmtRub(totalWithMarkupRounded)} />
                <InfoRow label="Торговая наценка в месяц:" value={fmtRub(monthlyMarkupRub)} />
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="w-full rounded-full py-3 text-white font-semibold transition shadow-sm mb-3"
                style={{ background: `linear-gradient(135deg, ${LOGO_BLUE} 0%, ${LOGO_GREEN} 100%)` }}
                onMouseOver={(e) => (e.currentTarget.style.background = `linear-gradient(135deg, ${LOGO_BLUE_HOVER} 0%, #5BA394 100%)`)}
                onMouseOut={(e) => (e.currentTarget.style.background = `linear-gradient(135deg, ${LOGO_BLUE} 0%, ${LOGO_GREEN} 100%)`)}
              >
                Оформить рассрочку
              </button>

              <p className="text-xs text-gray-500 leading-snug">
                Стоимость товара и приведенные расчеты через калькулятор являются предварительными. Для точного определения условий договора, пожалуйста, напишите в наш ватсап.
              </p>

              {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
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

      <ContactSection />
      
    </div>
  );
}

/** ===== вспомогательные ===== */
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-[#223042] text-base">{value}</span>
    </div>
  );
}
