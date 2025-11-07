import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./components/HomePage.jsx";
import Calculator from "./components/Calculator.jsx";
import ClientSearch from "./components/ClientSearch.jsx";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/check" element={<ClientSearch />} />
      </Routes>
    </Router>
  );
}
