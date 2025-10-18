import React, { useEffect, useState, useRef } from "react";
import { sendCalc, getWhatsAppNumber } from "../lib/api.js";
import { fmtRub } from "../lib/format.js";
import StatCard from "./StatCard.jsx";
import TermPicker from "./TermPicker.jsx";
import PriceSlider from "./PriceSlider.jsx";

export default function Calculator() {
  const [price, setPrice] = useState(50000);
  const [term, setTerm] = useState(3);
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [hasDown, setHasDown] = useState(false);
  const [downPayment, setDownPayment] = useState(0);
  const [clientName, setClientName] = useState("");
  const [productName, setProductName] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [wa, setWa] = useState("");
  const tickSound = useRef(null);

  useEffect(() => {
    getWhatsAppNumber().then(setWa);
  }, []);

  const calc = async () => {
    setError("");
    try {
      let downPercent = 0;
      if (hasDown && downPayment > 0) {
        downPercent = (downPayment / price) * 100;
      }
      const res = await sendCalc({
        productName,
        price: +price,
        term: +term,
        hasGuarantor,
        hasDown,
        downPercent,
      });
      setData(res);
    } catch (e) {
      setError(e.message);
      setData(null);
    }
  };

  useEffect(() => {
    calc();
  }, [price, term, hasGuarantor, hasDown, downPayment]);

  useEffect(() => {
    if (!hasGuarantor && term > 8) setTerm(8);
  }, [hasGuarantor]);

  const playTick = () => {
    if (tickSound.current) {
      tickSound.current.currentTime = 0;
      tickSound.current.play().catch(() => {});
    }
  };

  const sendWA = () => {
    if (!data) return alert("Сначала рассчитайте рассрочку");
    if (!clientName || !productName) return alert("Введите имя и товар");

    const msg = [
      "🛍️ *Новая заявка на рассрочку*",
      "",
      `👤 *Имя клиента:* ${clientName}`,
      `📦 *Товар:* ${productName}`,
      `💰 *Стоимость:* ${fmtRub(price)}`,
      `💳 *Первоначальный взнос:* ${hasDown ? fmtRub(downPayment) : "Нет"}`,
      `📆 *Срок:* ${term} мес.`,
      `🤝 *Поручитель:* ${hasGuarantor ? "Есть" : "Нет"}`,
      "",
      `📈 *Наценка за весь срок:* ${data.effectiveRate}%`,
      `💵 *Ежемесячный платёж:* ${fmtRub(data.monthlyPayment)}`,
      `➕ *Наценка в месяц:* ${fmtRub(data.totalMarkup / term)}`,
      `💼 *Итоговая сумма:* ${fmtRub(data.total)}`,
      "",
      "📨 _Отправлено автоматически через калькулятор рассрочки_",
    ].join("\n");

    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Заголовок */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-700 mb-8 sm:mb-10">
          💼 Калькулятор рассрочки
        </h1>

        {/* Информационный блок */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-md mb-8 text-sm sm:text-base text-gray-700">
          <p>
            <b>Условия:</b><br />
            С поручителем — до <b>150 000 ₽</b> и <b>10 мес.</b><br />
            Без поручителя — до <b>70 000 ₽</b> и <b>8 мес.</b><br />
            При наличии первого взноса — ставка по таблице со взносом.
          </p>
        </div>

        {/* Основная форма */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <PriceSlider
              value={price}
              setValue={setPrice}
              hasGuarantor={hasGuarantor}
              hasDown={hasDown}
            />

            <TermPicker
              term={term}
              setTerm={setTerm}
              hasGuarantor={hasGuarantor}
              playTick={playTick}
            />

            <Switch
              label="Есть поручитель"
              value={hasGuarantor}
              setValue={setHasGuarantor}
            />

            <Switch
              label="Есть первый взнос"
              value={hasDown}
              setValue={setHasDown}
            />

            {hasDown && (
              <TextField
                label="Размер первого взноса (₽)"
                placeholder="Например: 20000"
                value={downPayment}
                setValue={setDownPayment}
                rightIcon="₽"
                inputMode="numeric"
              />
            )}

            <TextField
              label="Ваше имя и фамилия"
              placeholder="Введите имя и фамилию"
              value={clientName}
              setValue={setClientName}
              leftIcon="👤"
            />

            <TextField
              label="Название товара"
              placeholder="Например: Galaxy S25 Ultra"
              value={productName}
              setValue={setProductName}
              leftIcon="📦"
            />
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button
              onClick={sendWA}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-white text-lg bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-lg transition-transform transform hover:scale-[1.02]"
            >
              📤 Отправить через WhatsApp
            </button>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="text-red-600 text-center mt-4 font-semibold">{error}</div>
        )}

        {/* Результаты */}
        {data && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <StatCard title="Наценка за весь срок" value={data.effectiveRate + "%"} />
            <StatCard title="Первоначальный взнос" value={fmtRub(data.downPayment)} />
            <StatCard title="Ежемесячный платёж" value={fmtRub(data.monthlyPayment)} />
            <StatCard title="Наценка в месяц" value={fmtRub(data.totalMarkup / term)} />
            <StatCard title="Итоговая сумма" value={fmtRub(data.total)} />
          </section>
        )}

        <audio ref={tickSound} src="/tick.mp3" preload="auto" />
      </div>
    </div>
  );
}

/* ——— Универсальные компоненты ——— */

function Switch({ label, value, setValue }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <span className="text-gray-800 font-medium text-sm sm:text-base">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => setValue(e.target.checked)}
        className="w-6 h-6 accent-green-600 cursor-pointer"
      />
    </div>
  );
}

function TextField({ label, value, setValue, placeholder, leftIcon, rightIcon, inputMode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <label className="block text-gray-600 text-sm mb-2">{label}</label>
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            {leftIcon}
          </span>
        )}
        <input
          type="text"
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full bg-white border border-gray-300 focus:ring-2 focus:ring-green-400 rounded-xl py-2 px-3 text-gray-900 text-sm sm:text-base outline-none transition ${
            leftIcon ? "pl-9" : ""
          } ${rightIcon ? "pr-9" : ""}`}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
}
