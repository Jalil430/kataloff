const DEFAULT_WHATSAPP_NUMBER = "79380000599";

const WITH_DOWN_MARKUP_BY_TERM = {
  3: 14.4,
  4: 19.2,
  5: 24,
  6: 24,
  7: 28.8,
  8: 33.6,
  9: 38.4,
  10: 43.2,
  11: 48,
  12: 52.8,
};

const WITHOUT_DOWN_MARKUP_BY_TERM = {
  3: 19.2,
  4: 24,
  5: 28.8,
  6: 28.8,
  7: 33.6,
  8: 38.4,
  9: 43.2,
  10: 48,
  11: 52.8,
  12: 57.6,
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const roundTo50 = (n) => Math.ceil(n / 50) * 50;

function limits(hasGuarantor, hasDown) {
  if (hasGuarantor && hasDown) {
    return { maxPrice: 200000, maxTerm: 12 };
  }
  if (hasGuarantor && !hasDown) {
    return { maxPrice: 100000, maxTerm: 10 };
  }
  if (!hasGuarantor && hasDown) {
    return { maxPrice: 100000, maxTerm: 10 };
  }

  throw new Error("Без поручителя требуется первый взнос");
}

function percentForTerm(term, hasDown) {
  const normalizedTerm = Math.round(clamp(Number(term) || 3, 3, 12));
  const markupTable = hasDown
    ? WITH_DOWN_MARKUP_BY_TERM
    : WITHOUT_DOWN_MARKUP_BY_TERM;

  return markupTable[normalizedTerm];
}

function compute(payload) {
  const req = { ...payload };

  if (!req.hasGuarantor && !req.hasDown) {
    req.hasGuarantor = true;
  }

  const { maxPrice, maxTerm } = limits(req.hasGuarantor, req.hasDown);

  if (req.price > maxPrice) {
    throw new Error("Превышена допустимая сумма");
  }
  if (req.term > maxTerm) {
    throw new Error("Превышен срок рассрочки");
  }

  const tradeMarkupPercent = percentForTerm(req.term, req.hasDown);
  const totalMarkup = req.price * (tradeMarkupPercent / 100);
  const totalWithMarkup = req.price + totalMarkup;

  let downPayment = 0;
  if (req.hasDown) {
    const minDownPayment = totalWithMarkup * 0.2;

    if (req.downPayment > 0) {
      downPayment = req.downPayment;
    } else if (req.downPercent > 0) {
      downPayment = totalWithMarkup * (req.downPercent / 100);
    } else {
      downPayment = minDownPayment;
    }

    downPayment = clamp(downPayment, minDownPayment, totalWithMarkup);
    downPayment = roundTo50(downPayment);
    downPayment = Math.min(downPayment, totalWithMarkup);
  }

  const financed = totalWithMarkup - downPayment;
  const monthlyPayment = roundTo50(financed / req.term);
  const total = monthlyPayment * req.term + downPayment;

  return {
    effectiveRate: tradeMarkupPercent,
    monthlyPayment,
    total,
    totalMarkup: total - req.price,
    downPayment,
  };
}

/**
 * Расчёт рассрочки в браузере. Повторяет правила прежнего Go API.
 */
export async function sendCalc(payload) {
  return compute(payload);
}

/**
 * Получение WhatsApp-номера продавца из публичной frontend-конфигурации.
 */
export async function getWhatsAppNumber() {
  return import.meta.env?.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
}
