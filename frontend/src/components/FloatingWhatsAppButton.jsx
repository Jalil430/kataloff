import React, { useEffect, useState } from "react";
import { getWhatsAppNumber } from "../lib/api.js";
import Lottie from "lottie-react";
import whatsappAnimation from "../assets/icons8-whatsapp.json";

export default function FloatingWhatsAppButton() {
  const [waNumber, setWaNumber] = useState("");

  useEffect(() => {
    getWhatsAppNumber().then(setWaNumber).catch(() => {});
  }, []);

  const handleClick = () => {
    if (!waNumber) return;
    window.open(`https://wa.me/${waNumber}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full shadow-lg transition transform hover:scale-110"
      style={{
        width: "80px",
        height: "80px",
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
      aria-label="Связаться через WhatsApp"
    >
      <Lottie
        animationData={whatsappAnimation}
        loop
        autoplay
        style={{
          width: "80px",
          height: "80px",
        }}
      />
    </button>
  );
}
