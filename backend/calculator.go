package main

import (
	"errors"
	"math"
)

type CalcRequest struct {
	ProductName  string  `json:"productName"`
	Price        float64 `json:"price"`
	Term         int     `json:"term"`
	HasGuarantor bool    `json:"hasGuarantor"`
	HasDown      bool    `json:"hasDown"`
	DownPercent  float64 `json:"downPercent"`
}

type CalcResponse struct {
	EffectiveRate  float64 `json:"effectiveRate"`  // торговая наценка (%)
	MonthlyPayment float64 `json:"monthlyPayment"` // платёж в месяц
	Total          float64 `json:"total"`          // сумма к оплате
	TotalMarkup    float64 `json:"totalMarkup"`    // общая наценка
	DownPayment    float64 `json:"downPayment"`    // первоначальный взнос
}

// ---------- Основная логика ----------
func compute(req CalcRequest) (CalcResponse, error) {
	maxPrice, maxTerm, err := limits(req.HasGuarantor, req.HasDown)
	if err != nil {
		return CalcResponse{}, err
	}

	// проверки лимитов
	if req.Price > maxPrice {
		return CalcResponse{}, errors.New("Превышена допустимая сумма")
	}
	if req.Term > maxTerm {
		return CalcResponse{}, errors.New("Превышен срок рассрочки")
	}

	// 🧮 Получаем торговую наценку (не процент кредита!)
	tradeMarkupPercent := percentForTerm(req.Term, req.HasDown)

	// 💵 Рассчитываем первый взнос
	downPayment := 0.0
	if req.HasDown {
		if req.DownPercent > 0 {
			downPayment = req.Price * (req.DownPercent / 100)
		} else {
			downPayment = req.Price * 0.2 // Default to 20% minimum
		}
		// Ensure minimum 20% down payment
		minDownPayment := req.Price * 0.2
		if downPayment < minDownPayment {
			downPayment = minDownPayment
		}
	}

	// 💳 Расчёты
	// Apply markup to the full product price, not just financed amount
	totalWithMarkup := req.Price * (1 + baseRate/100)
	totalMarkup := totalWithMarkup - req.Price
	financedAmount := totalWithMarkup - downPayment
	monthly := financedAmount / float64(req.Term)

	return CalcResponse{
		EffectiveRate:  baseRate,
		MonthlyPayment: math.Round(monthly),
		Total:          math.Round(totalWithMarkup),
		TotalMarkup:    math.Round(totalMarkup),
		DownPayment:    math.Round(downPayment),
	}, nil
}

// ---------- Лимиты ----------
func limits(guarantor, down bool) (float64, int, error) {
	switch {
	case !guarantor:
		return 70000, 8, nil
	case guarantor && !down:
		return 100000, 10, nil
	case guarantor && down:
		// С поручителем и взносом — до 200 000 ₽ и 10 мес
		return 200000, 10, nil

	default:
		return 0, 0, errors.New("некорректное сочетание параметров")
	}
}

// ---------- Таблица торговой наценки ----------
func percentForTerm(term int, hasDown bool) float64 {
	if term < 3 {
		term = 3
	}
	if term > 10 {
		term = 10
	}


	withDown := map[int]float64{
		3: 15, 4: 19, 5: 23, 6: 28, 7: 33, 8: 38, 9: 43, 10: 48, 11: 53, 12: 58,
	}
	noDown := map[int]float64{
		3: 19, 4: 23, 5: 28, 6: 33, 7: 38, 8: 43, 9: 48, 10: 53,
	}

	if hasDown {
		return withDown[term]
	}
	return noDown[term]
}
