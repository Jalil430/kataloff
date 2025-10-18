import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white p-6">
      <h1 className="text-4xl font-extrabold mb-12 text-center drop-shadow-xl">
        💼 Добро пожаловать в калькулятор рассрочки
      </h1>

      <div className="flex flex-col sm:flex-row gap-8">
        <Link
          to="/calculator"
          className="relative overflow-hidden bg-white/10 hover:bg-white/20 text-white text-xl px-10 py-5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-md border border-white/20"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 hover:opacity-40 transition-opacity duration-300 rounded-2xl"></span>
          💰 Рассчитать рассрочку
        </Link>

        <Link
          to="/check"
          className="relative overflow-hidden bg-white/10 hover:bg-white/20 text-white text-xl px-10 py-5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-md border border-white/20"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 hover:opacity-40 transition-opacity duration-300 rounded-2xl"></span>
          📄 Моя рассрочка
        </Link>
      </div>

      <footer className="mt-16 text-white/70 text-sm">
        © {new Date().getFullYear()} Katloff FinTech. Все права защищены.
      </footer>
    </div>
  );
}
