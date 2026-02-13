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

// --- Округление вверх до ближайших 50 ₽ ---
func roundTo50(n float64) float64 {
	return math.Ceil(n/50) * 50
}

func compute(req CalcRequest) (CalcResponse, error) {
	maxPrice, maxTerm, err := limits(req.HasGuarantor, req.HasDown)
	if err != nil {
		return CalcResponse{}, err
	}

	if req.Price > maxPrice {
		return CalcResponse{}, errors.New("Превышена допустимая сумма")
	}
	if req.Term > maxTerm {
		return CalcResponse{}, errors.New("Превышен срок рассрочки")
	}

	tradeMarkupPercent := percentForTerm(req.Term, req.HasDown)

	downPayment := 0.0
	if req.HasDown {
		if req.DownPercent > 0 {
			downPayment = req.Price * (req.DownPercent / 100)
		} else {
			downPayment = req.Price * 0.2
		}
		if downPayment < req.Price*0.2 {
			downPayment = req.Price * 0.2
		}
	}

	totalMarkup := req.Price * (tradeMarkupPercent / 100)
	totalWithMarkup := req.Price + totalMarkup
	financed := totalWithMarkup - downPayment

	// округление
	rawMonthly := financed / float64(req.Term)
	monthlyRounded := roundTo50(rawMonthly)

	totalRounded := monthlyRounded*float64(req.Term) + downPayment
	totalMarkupRounded := totalRounded - req.Price

	return CalcResponse{
		EffectiveRate:  tradeMarkupPercent,
		MonthlyPayment: monthlyRounded,
		Total:          totalRounded,
		TotalMarkup:    totalMarkupRounded,
		DownPayment:    downPayment,
	}, nil
}

// ---------- Лимиты ----------
func limits(guarantor, down bool) (float64, int, error) {
	switch {
	case guarantor && down:
		// Поручитель + первый взнос — до 200 000 ₽ и 12 мес
		return 200000, 12, nil
	case guarantor && !down:
		// Только поручитель — до 70 000 ₽ и 10 мес
		return 70000, 10, nil
	case !guarantor && down:
		// Без поручителя, но с первым взносом — до 70 000 ₽ и 10 мес
		return 70000, 10, nil
	default:
		// Без поручителя первый взнос обязателен
		return 0, 0, errors.New("Без поручителя требуется первый взнос")
	}
}

// ---------- Таблица торговой наценки ----------
func percentForTerm(term int, hasDown bool) float64 {
	if term < 3 {
		term = 3
	}
	if term > 12 {
		term = 12
	}

	withDown := map[int]float64{
		3: 14.4, 4: 19.2, 5: 24, 6: 24, 7: 28.8, 8: 33.6, 9: 38.4, 10: 43.2, 11: 48, 12: 52.8,
	}
	noDown := map[int]float64{
		3: 19.2, 4: 24, 5: 28.8, 6: 28.8, 7: 33.6, 8: 38.4, 9: 43.2, 10: 48, 11: 52.8, 12: 57.6,
	}

	if hasDown {
		return withDown[term]
	}
	return noDown[term]
}
