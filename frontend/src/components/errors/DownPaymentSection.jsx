import React, { useEffect } from "react";
import { toNumber } from "../utils.js";
import { updateSliderFill } from "../useSliderFill.js";

export default function DownPaymentSection({
  hasDown,
  price,
  downPayment,
  downInputValue,
  setDownPayment,
  setDownInputValue,
  downPercent,
  setDownPercent
}) {
  useEffect(() => {
    const slider = document.querySelector("#down-slider");
    if (slider && hasDown) updateSliderFill(slider, downPayment, Math.round(price * 0.25), price);
  }, [price, downPayment, hasDown]);

  if (!hasDown) return null;

  return (
    <section>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#223042]">Первоначальный взнос</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={downInputValue}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9\s]/g, '');
              setDownInputValue(val);
              setDownPayment(toNumber(val));
            }}
            className="pill-input w-36"
          />
          <input
            type="number"
            value={downPercent}
            onChange={(e) => {
              const val = Number(e.target.value) || 0;
              setDownPercent(val);
              const rub = Math.round((price * val) / 100);
              setDownPayment(rub);
              setDownInputValue(new Intl.NumberFormat("ru-RU").format(rub));
            }}
            className="pill-input-percent-small w-20"
          />
        </div>
      </div>
      <input
        id="down-slider"
        className="sber-range marks-4 w-full"
        type="range"
        min={Math.round(price * 0.25)}
        max={price}
        step={500}
        value={downPayment}
        onChange={(e) => setDownPayment(Number(e.target.value))}
      />
    </section>
  );
}
