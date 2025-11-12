const LOGO_BLUE = "#043c6f";
const LOGO_GREEN = "#5bc5a7";
const LOGO_MID = "#2d9f8a";

export default function ContactSection() {
  const handleWhatsAppClick = () => {
    const message = "Здравствуйте! Хочу узнать больше об исламской рассрочке.";
    window.open(`https://wa.me/79380000599?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="py-16 bg-[#f6f7fb]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#223042] mb-4">
              Связаться с нами
            </h2>
            <p className="text-lg text-gray-600">
              Остались вопросы? Мы готовы помочь вам с оформлением рассрочки
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#223042] mb-1">Телефон</h3>
                  <a href="tel:+79380000599" className="text-[#2d9f8a] hover:text-[#043c6f] transition-colors font-medium">
                    +7 (938) 000-05-99
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#043c6f] to-[#5bc5a7] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#223042] mb-1">Email</h3>
                  <a href="mailto:kataloff.if@yandex.com" className="text-[#2d9f8a] hover:text-[#043c6f] transition-colors font-medium">
                    kataloff.if@yandex.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-2xl hover:bg-[#20BA5A] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              <span>Написать в WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}