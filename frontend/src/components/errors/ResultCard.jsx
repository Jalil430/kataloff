import React from "react";
import InfoRow from "./InfoRow.jsx";

export default function ResultCard({ data, monthlyOverpay, fmtRub, onApply, error }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="text-gray-500 text-sm mb-2">Ежемесячный платёж:</div>
      <div className="text-3xl font-bold mb-4 text-[#223042]">
        {data ? fmtRub(data.monthlyPayment) : "—"}
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm mb-6">
        <InfoRow label="Общая сумма рассрочки:" value={data ? fmtRub(data.total) : "—"} />
        <InfoRow label="Торговая наценка в месяц:" value={data ? fmtRub(monthlyOverpay) : "—"} />
      </div>

      <button
        onClick={onApply}
        className="w-full rounded-full py-3 text-white font-semibold transition shadow-sm mb-3"
        style={{ background: "linear-gradient(135deg, #1A3A5C 0%, #4A9B7E 100%)" }}
      >
        Оформить рассрочку
      </button>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
