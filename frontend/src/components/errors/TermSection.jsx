import React, { useEffect } from "react";
import { clamp } from "./utils.js";
import { updateSliderFill } from "./useSliderFill.js";

export default function TermSection({ term, maxTerm, setTerm, termInputValue, setTermInputValue }) {
  useEffect(() => {
    const slider = document.querySelector("#term-slider");
    if (slider) updateSliderFill(slider, term, 3, maxTerm);
  }, [term, maxTerm]);

  return (
    <section>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#223042]">Срок рассрочки</h3>
        <input
          type="number"
          value={termInputValue}
          min={3}
          max={maxTerm}
          onChange={(e) => setTermInputValue(e.target.value)}
          onBlur={() => {
            const val = clamp(Number(termInputValue) || 3, 3, maxTerm);
            setTerm(val);
            setTermInputValue(val.toString());
          }}
          className="pill-input w-56"
        />
      </div>
      <input
        id="term-slider"
        className="sber-range marks-4 w-full"
        type="range"
        min={3}
        max={maxTerm}
        step={1}
        value={term}
        onChange={(e) => setTerm(Number(e.target.value))}
      />
    </section>
  );
}
