import { useState } from "react";
import ContactSection from "./ContactSection.jsx";

export default function ClientSearch() {
  const [fio, setFio] = useState("");
  const [clientId, setClientId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const TOKEN = import.meta.env.VITE_API_TOKEN;

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
    if (lower.includes("оплачен")) return "bg-green-50 text-green-600 border border-green-200";
    if (lower.includes("предстоящ")) return "bg-[#E3F2FD] text-[#42A5F5] border border-[#BBDEFB]";
    if (lower.includes("просроч")) return "bg-red-50 text-red-600 border border-red-200";
    if (lower.includes("сегодня")) return "bg-orange-50 text-orange-600 border border-orange-200";
    return "bg-gray-50 text-gray-600 border border-gray-200";
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getPaymentName = (payment, index) => {
    // Check if it's a down payment (usually payment_number 0 or first payment with different characteristics)
    if (payment.payment_number === 0 || (index === 0 && payment.expected_amount > payment.expected_amount * 1.5)) {
      return "Первый взнос";
    }
    return `Месяц ${payment.payment_number}`;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6f7fb]">
      <div className="container mx-auto px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-3xl font-semibold mb-2 text-[#223042]">
            Мои рассрочки
          </h1>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#223042] mb-4">Поиск рассрочек</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Фамилия Имя Отчество"
              value={fio}
              onChange={(e) => setFio(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4A9B7E] focus:border-[#4A9B7E] outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Первые 8 символов ID клиента"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              maxLength={8}
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4A9B7E] focus:border-[#4A9B7E] outline-none transition-colors"
            />
            <button
              onClick={searchInstallments}
              disabled={loading || !fio || !clientId}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                loading || !fio || !clientId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#1A3A5C] to-[#4A9B7E] text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {loading ? "Поиск..." : "Найти"}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Client Info Card */}
        {data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#223042] mb-4">Информация о клиенте</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Имя:</span>
                <span className="font-semibold text-[#223042] text-base">{data.client.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">ID клиента:</span>
                <span className="font-semibold text-[#223042] text-base">{data.client.short_id}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Всего рассрочек:</span>
                <span className="font-semibold text-[#223042] text-base">{data.summary.total_installments}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Оплачено:</span>
                <span className="font-semibold text-[#223042] text-base">{formatCurrency(data.summary.total_paid)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Остаток:</span>
                <span className="font-semibold text-[#223042] text-base">{formatCurrency(data.summary.total_remaining)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Просрочек:</span>
                <span className="font-semibold text-[#223042] text-base">{data.summary.overdue_count}</span>
              </div>
            </div>
          </div>
        )}

        {/* Installment Cards */}
        {data && data.installments.map((inst, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
            {/* Installment Header */}
            <div
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-[#223042] mb-1">
                  {inst.product_name}
                </h4>
              </div>

              <div className="flex items-center justify-between w-full max-w-2xl text-sm">
                <div className="text-left">
                  <div className="font-semibold text-[#223042]">№ {inst.installment_number}</div>
                  <div className="text-gray-500">Договор</div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#223042]">{inst.term_months} мес.</div>
                  <div className="text-gray-500">Срок</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#223042]">{formatCurrency(inst.installment_price)}</div>
                  <div className="text-gray-500">Стоимость</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#223042]">{formatCurrency(inst.remaining_amount)}</div>
                  <div className="text-gray-500">Остаток</div>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-normal w-28 text-center ${getStatusStyle(inst.payment_status)}`}>
                  {capitalizeFirst(inst.payment_status)}
                </span>
                <div className="text-gray-400 text-xl">
                  {openIndex === i ? "▴" : "▾"}
                </div>
              </div>
            </div>

            {/* Expandable Payments List */}
            {openIndex === i && inst.payments && (
              <div className="border-t border-gray-200 p-6">
                <h5 className="font-semibold text-[#223042] mb-4">График платежей</h5>
                <div className="space-y-3">
                  {inst.payments.map((payment, j) => {
                    const today = new Date().toISOString().split("T")[0];
                    let status = payment.is_paid
                      ? "Оплачено"
                      : new Date(payment.due_date) < new Date(today)
                      ? "Просрочено"
                      : new Date(payment.due_date).toDateString() === new Date(today).toDateString()
                      ? "К оплате"
                      : "Предстоящий";
                    
                    const displayAmount = payment.is_paid && payment.paid_amount 
                      ? payment.paid_amount 
                      : payment.expected_amount;
                    
                    return (
                      <div key={j} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between w-full text-sm">
                          <div className="text-left">
                            <div className="font-semibold text-[#223042]">
                              {getPaymentName(payment, j)}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-[#223042]">
                              {formatDate(payment.due_date)}
                            </div>
                            <div className="text-gray-500">Срок оплаты</div>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-[#223042]">
                              {formatCurrency(displayAmount)}
                            </div>
                            <div className="text-gray-500">
                              {payment.is_paid ? "Оплачено" : "К оплате"}
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-normal w-28 text-center ${getStatusStyle(status)}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ContactSection />
    </div>
  );
}