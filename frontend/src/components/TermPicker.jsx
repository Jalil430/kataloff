import React, { useRef, useEffect, useState } from "react";

export default function TermPicker({ term, setTerm, hasGuarantor, playTick }) {
  const maxTerm = hasGuarantor ? 10 : 8;
  const terms = Array.from({ length: maxTerm - 2 }, (_, i) => i + 3);

  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);
  const itemHeight = 40;

  // ✅ Определяем устройство
  useEffect(() => {
    const checkMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  // ✅ Wheel-поведение для мобильных
  useEffect(() => {
    if (!isMobile) return;
    const container = scrollRef.current;
    if (!container) return;
    const index = terms.indexOf(term);
    const scrollPos = index * itemHeight - container.clientHeight / 2 + itemHeight / 2;
    container.scrollTo({ top: scrollPos, behavior: "smooth" });
  }, [term, isMobile, hasGuarantor]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const centerY = container.scrollTop + container.clientHeight / 2;
    const index = Math.round(centerY / itemHeight - 0.5);
    const newTerm = terms[index];

    if (newTerm && newTerm !== term) {
      setTerm(newTerm);
      playTick?.();
    }
  };

  // ✅ Мобильный вариант (iOS scroll wheel)
  if (isMobile) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
        <label className="block text-sm text-gray-600 mb-3">
          Срок рассрочки
        </label>

        <div
          ref={scrollRef}
          onScroll={() => {
            clearTimeout(scrollRef.current?._scrollTimeout);
            scrollRef.current._scrollTimeout = setTimeout(handleScroll, 80);
          }}
          className="relative h-[160px] overflow-y-scroll scrollbar-hide snap-y snap-mandatory select-none"
        >
          {/* Подсветка выбранного центра */}
          <div className="absolute top-1/2 left-0 w-full h-[40px] bg-emerald-100/40 -translate-y-1/2 rounded-lg pointer-events-none" />

          <div style={{ height: "60px" }} />
          {terms.map((m) => (
            <div
              key={m}
              onClick={() => {
                setTerm(m);
                playTick?.();
              }}
              style={{
                height: `${itemHeight}px`,
                lineHeight: `${itemHeight}px`,
              }}
              className={`snap-center text-lg font-semibold transition ${
                term === m
                  ? "text-emerald-600 scale-110"
                  : "text-gray-700 hover:text-emerald-400"
              }`}
            >
              {m} мес.
            </div>
          ))}
          <div style={{ height: "60px" }} />
        </div>

        <p className="text-gray-500 text-sm mt-2">
          Выбранный срок: <b>{term} мес.</b>
        </p>
      </div>
    );
  }

  // ✅ Десктопный вариант (выпадающий список)
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <label className="block text-sm text-gray-600 mb-2">
        Срок рассрочки
      </label>
      <select
        value={term}
        onChange={(e) => {
          setTerm(Number(e.target.value));
          playTick?.();
        }}
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-800 bg-white font-medium"
      >
        {terms.map((m) => (
          <option key={m} value={m}>
            {m} мес.
          </option>
        ))}
      </select>
    </div>
  );
}
