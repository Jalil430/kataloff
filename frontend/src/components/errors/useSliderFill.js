import { LOGO_GREEN } from "./constants.js";

export const updateSliderFill = (slider, value, min, max) => {
  if (!slider) return;
  const percentage = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, ${LOGO_GREEN} 0%, ${LOGO_GREEN} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
};
