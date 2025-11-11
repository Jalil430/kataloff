import { Link } from "react-router-dom";
import ContactSection from "./ContactSection.jsx";

const LOGO_BLUE = "#043c6f";
const LOGO_GREEN = "#5bc5a7";
const LOGO_MID = "#2d9f8a";
const INFO_BLUE = "#42A5F5";
const INFO_BLUE_BG = "#E3F2FD";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6f7fb]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#043c6f] via-[#2B7A8F] to-[#5bc5a7] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Исламское финансирование <span className="text-[#2d9f8a]">без процентов</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
              Получите товары в рассрочку по принципам шариата. Прозрачные условия, 
              честные расчеты, без скрытых комиссий и процентов.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#043c6f] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                Рассчитать рассрочку
              </Link>
              <Link
                to="/check"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 border border-white/30 text-lg backdrop-blur-sm"
              >
                Проверить рассрочку
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#223042] mb-4">
              Почему выбирают Kataloff?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Мы предлагаем справедливые условия финансирования в соответствии с исламскими принципами
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#223042] mb-4">Без процентов</h3>
              <p className="text-gray-600 leading-relaxed">
                Никаких процентов и скрытых комиссий. Только честная торговая наценка, 
                которая известна заранее.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#223042] mb-4">Прозрачность</h3>
              <p className="text-gray-600 leading-relaxed">
                Все условия договора понятны и прозрачны. Вы знаете точную сумму 
                каждого платежа с самого начала.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#223042] mb-4">Быстрое оформление</h3>
              <p className="text-gray-600 leading-relaxed">
                Простая процедура оформления. Рассчитайте условия онлайн и 
                получите одобрение в кратчайшие сроки.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[#f6f7fb]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#223042] mb-4">
              Как это работает?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Простой процесс получения рассрочки в несколько шагов
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-[#223042] mb-4">Рассчитайте</h3>
                <p className="text-gray-600">
                  Используйте наш калькулятор для расчета условий рассрочки
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-[#223042] mb-4">Подайте заявку</h3>
                <p className="text-gray-600">
                  Заполните простую форму и отправьте заявку на рассмотрение
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-[#223042] mb-4">Получите товар</h3>
                <p className="text-gray-600">
                  После одобрения получите желаемый товар и начните выплаты
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#043c6f] to-[#5bc5a7] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готовы начать?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Рассчитайте условия рассрочки прямо сейчас и получите товар уже сегодня
          </p>
          <Link
            to="/calculator"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#043c6f] font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            Рассчитать рассрочку
          </Link>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
