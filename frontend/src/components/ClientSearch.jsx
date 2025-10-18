import React, { useState } from "react";

export default function ClientSearch() {
  const [fio, setFio] = useState("");
  const [clientId, setClientId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const API_URL = "https://d5degr4sfnv9p7i065ga.kf69zffa.apigw.yandexcloud.net";
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDNkYzljZTItM2U2Ni00MzAyLWE4YmMtOGY2YmY4YjM5MjlhIiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTc5MjEzNTgxNiwiY29tcGFueSI6IkthdGFsb2ZmIn0.gxSX9ZBV0yoc-cgV8zEmRywUdtpRVJLX07hq_R-P_XQ";

  const searchInstallments = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const shortId = clientId.trim().substring(0, 8);
      const url = `${API_URL}/installments/search?client_id=${encodeURIComponent(
        shortId
      )}&client_name=${encodeURIComponent(fio)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok)
        throw new Error("Не удалось получить данные (проверьте ID и ФИО)");

      const json = await res.json();
      if (!json || !json.installments || json.installments.length === 0)
        throw new Error("Рассрочки не найдены");

      setData(json);
    } catch (e) {
      console.error("Ошибка запроса:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const lower = status.toLowerCase();
    if (lower.includes("оплачен")) return "bg-green-100 text-green-700";
    if (lower.includes("предстоящ")) return "bg-blue-100 text-blue-700";
    if (lower.includes("просроч")) return "bg-red-100 text-red-700";
    if (lower.includes("сегодня")) return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-6xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-green-700">
          🔍 Проверка рассрочек клиента
        </h2>

        {/* --- Поля поиска --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Фамилия Имя Отчество"
            value={fio}
            onChange={(e) => setFio(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 bg-white/60 backdrop-blur-md focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Первые 8 символов ID клиента"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 bg-white/60 backdrop-blur-md focus:ring-2 focus:ring-green-400 focus:outline-none"
            maxLength={8}
          />
          <button
            onClick={searchInstallments}
            disabled={loading || !fio || !clientId}
            className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 ${
              loading || !fio || !clientId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 hover:shadow-green-300/50"
            }`}
          >
            {loading ? "Поиск..." : "Найти"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center font-semibold">{error}</p>
        )}

        {/* --- Результаты --- */}
        {data && (
          <div className="bg-white/80 backdrop-blur-lg text-gray-900 rounded-2xl p-6 shadow-inner mt-6 border border-gray-200">
            {/* Инфо о клиенте */}
            <h3 className="text-2xl font-bold text-green-700 mb-4">
              👤 Информация о клиенте
            </h3>
            <div className="grid md:grid-cols-2 gap-2 text-gray-700 mb-6">
              <p><b>Имя:</b> {data.client.name}</p>
              <p><b>ID клиента:</b> {data.client.short_id}</p>
              <p><b>Всего рассрочек:</b> {data.summary.total_installments}</p>
              <p><b>Оплачено:</b> {data.summary.total_paid} ₽</p>
              <p><b>Остаток:</b> {data.summary.total_remaining} ₽</p>
              <p><b>Просрочек:</b> {data.summary.overdue_count}</p>
            </div>

            {/* --- Список рассрочек --- */}
            <h4 className="text-xl font-bold text-green-700 mb-4">
              💰 Список рассрочек
            </h4>

            <div className="space-y-4">
              {data.installments.map((inst, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-lg"
                >
                  {/* Заголовок рассрочки */}
                  <div
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div>
                      <div className="text-lg font-semibold text-green-700">
                        {inst.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Договор № {inst.installment_number} • {inst.term_months} мес.
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <b>{inst.installment_price}</b> ₽
                      </div>
                      <div>
                        Остаток: <b>{inst.remaining_amount}</b> ₽
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-semibold ${getStatusStyle(
                          inst.payment_status
                        )}`}
                      >
                        {inst.payment_status}
                      </span>
                      <div className="text-gray-400 text-xl">
                        {openIndex === i ? "▴" : "▾"}
                      </div>
                    </div>
                  </div>

                  {/* Выпадающая таблица */}
                  {openIndex === i && inst.payments && (
                    <div className="animate-fadeIn px-6 pb-4 bg-gray-50/50">
                      <table className="w-full mt-2 border-collapse text-sm">
                        <thead className="text-gray-700 border-b">
                          <tr className="bg-green-100">
                            <th className="p-2 text-left">№</th>
                            <th className="p-2 text-left">Дата оплаты</th>
                            <th className="p-2 text-left">Сумма</th>
                            <th className="p-2 text-left">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inst.payments.map((p, j) => {
                            const today = new Date().toISOString().split("T")[0];
                            let status = p.is_paid
                              ? "Оплачено"
                              : new Date(p.due_date) < new Date(today)
                              ? "Просрочен"
                              : new Date(p.due_date).toDateString() ===
                                new Date(today).toDateString()
                              ? "К оплате сегодня"
                              : "Предстоящий";
                            return (
                              <tr key={j} className="border-b hover:bg-gray-100">
                                <td className="p-2">{p.payment_number}</td>
                                <td className="p-2">{formatDate(p.due_date)}</td>
                                <td className="p-2">{p.expected_amount} ₽</td>
                                <td className="p-2">
                                  <span
                                    className={`px-3 py-1 rounded-xl text-xs font-semibold ${getStatusStyle(
                                      status
                                    )}`}
                                  >
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
