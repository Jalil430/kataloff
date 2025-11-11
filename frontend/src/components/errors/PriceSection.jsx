import React, { useEffect } from "react";
import { clamp, toNumber } from "../utils.js";
import { updateSliderFill } from "../useSliderFill.js";

export default function PriceSection({ price, maxPrice, setPrice, setPriceInputValue, priceInputValue }) {
  useEffect(() => {
    const slider = document.querySelector("#price-slider");
    if (slider) updateSliderFill(slider, price, 0, maxPrice);
  }, [price, maxPrice]);

  const handleInput = (val) => {
    const cleanVal = val.replace(/[^0-9\s]/g, '');
    const displayVal = cleanVal === '' ? '0' : cleanVal;
    setPriceInputValue(displayVal);
    const numericValue = toNumber(displayVal);
    if (numericValue >= 0) setPrice(numericValue);
  };

  return (
    <section>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#223042]">Стоимость товара</h3>
        <input
          type="text"
          value={priceInputValue}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={() => {
            const clamped = clamp(toNumber(priceInputValue), 0, maxPrice);
            setPrice(clamped);
            setPriceInputValue(new Intl.NumberFormat("ru-RU").format(clamped));
          }}
          className="pill-input w-56"
        />
      </div>
      <input
        id="price-slider"
        className="sber-range marks-4 w-full"
        type="range"
        min={0}
        max={maxPrice}
        step={1000}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />
    </section>
  );
}
