import React, { useEffect, useMemo } from "react";
import { fmtRub } from "../lib/format.js";

export default function PriceSlider({ value, setValue, hasGuarantor, hasDown }) {
  // лимит по условиям
  const { maxValue, label } = useMemo(() => {
    if (hasGuarantor && hasDown)
      return { maxValue: 150000, label: "С поручителем и первым взносом — до 150 000 ₽" };
    if (hasGuarantor)
      return { maxValue: 100000, label: "С поручителем — до 100 000 ₽" };
    return { maxValue: 70000, label: "Без поручителя — до 70 000 ₽" };
  }, [hasGuarantor, hasDown]);

  // если лимит уменьшился — подрезаем значение и сразу обновляем
  useEffect(() => {
    if (value > maxValue) setValue(maxValue);
  }, [maxValue]); // eslint-disable-line

  const handleRange = (e) => setValue(Number(e.target.value));

  const handleInput = (e) => {
    const raw = e.target.value.replace(/\s/g, "");
    const n = Number(raw || 0);
    if (Number.isNaN(n)) return;
    setValue(Math.max(0, Math.min(n, maxValue)));
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-gray-200 shadow-md transition-all">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Стоимость товара
      </label>

      {/* ручной ввод */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          inputMode="numeric"
          value={value || ""}
          onChange={handleInput}
          placeholder="0"
          className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-300 text-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition"
        />
        <span className="text-lg font-semibold text-gray-700">₽</span>
      </div>

      {/* range */}
      <input
        type="range"
        min={0}
        max={maxValue}
        step={500}
        value={value}
        onChange={handleRange}
        className="w-full h-2 rounded-full bg-emerald-200 accent-emerald-600 cursor-pointer"
      />

 
    </div>
  );
}
