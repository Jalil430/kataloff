import React from "react";

const SBER_BLUE = "#0B5CD5";
const SBER_BLUE_HOVER = "#0A4FB6";

export default function ModalForm({
  onClose,
  onSubmit,
  clientName,
  setClientName,
  productName,
  setProductName,
}) {
  return (
    <div className="fixed inset-0 z-50">
      {/* затемнение */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* панель */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Оформить заявку</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Имя клиента</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Введите ФИО"
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Название товара</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Например: iPhone 15"
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              />
            </div>

            <button
              onClick={onSubmit}
              className="w-full rounded-full py-3 text-white font-semibold transition shadow-sm"
              style={{ background: SBER_BLUE }}
              onMouseOver={(e) => (e.currentTarget.style.background = SBER_BLUE_HOVER)}
              onMouseOut={(e) => (e.currentTarget.style.background = SBER_BLUE)}
            >
              Отправить в WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
