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
    <>
      <style>{`
        .floating-whatsapp-btn {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none; /* убираем фон */
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s ease;
        }

        .floating-whatsapp-btn:hover {
          transform: scale(1.08);
        }

        .floating-whatsapp-icon {
          width: 64px;
          height: 64px;
        }

        /* уменьшение для мобильных */
        @media (max-width: 640px) {
          .floating-whatsapp-btn {
            bottom: 12px;
            right: 12px;
          }

          .floating-whatsapp-icon {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>

      <button
        onClick={handleClick}
        className="floating-whatsapp-btn"
        aria-label="Связаться через WhatsApp"
      >
        <Lottie
          animationData={whatsappAnimation}
          loop={false}
          autoplay={false}
          initialSegment={[0, 0]}
          className="floating-whatsapp-icon"
          style={{ background: "none" }} // убираем внутренний белый фон, если он есть
        />
      </button>
    </>
  );
}
