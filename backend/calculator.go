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
	EffectiveRate  float64 `json:"effectiveRate"`  // % за весь срок
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

	// 💰 Получаем ставку из таблицы
	baseRate := percentForTerm(req.Term, req.HasDown)

	// 💵 Рассчитываем первый взнос
	downPayment := 0.0
	if req.HasDown {
		if req.DownPercent > 0 {
			downPayment = req.Price * (req.DownPercent / 100)
		} else {
			downPayment = req.Price * 0.1
		}
	}

	// 💳 Расчёты
	financed := req.Price - downPayment
	total := financed * (1 + baseRate/100)
	monthly := total / float64(req.Term)
	totalMarkup := total - financed

	return CalcResponse{
		EffectiveRate:  baseRate,
		MonthlyPayment: math.Round(monthly),
		Total:          math.Round(total + downPayment),
		TotalMarkup:    math.Round(totalMarkup),
		DownPayment:    math.Round(downPayment),
	}, nil
}

// ---------- Лимиты ----------
func limits(guarantor, down bool) (float64, int, error) {
	switch {
	case !guarantor:
		// Без поручителя — максимум 70 000 ₽ и 8 мес
		return 70000, 8, nil

	case guarantor && !down:
		// С поручителем, без взноса — до 100 000 ₽ и 10 мес
		return 100000, 10, nil

	case guarantor && down:
		// С поручителем и взносом — до 150 000 ₽ и 10 мес
		return 150000, 10, nil

	default:
		return 0, 0, errors.New("некорректное сочетание параметров")
	}
}

// ---------- Таблица процентов ----------
func percentForTerm(term int, hasDown bool) float64 {
	if term < 3 {
		term = 3
	}
	if term > 10 {
		term = 10
	}

	withDown := map[int]float64{
		3: 15, 4: 18, 5: 21, 6: 25, 7: 29, 8: 33, 9: 37, 10: 41,
	}
	noDown := map[int]float64{
		3: 20, 4: 23, 5: 27, 6: 32, 7: 36, 8: 40,
	}

	if hasDown {
		return withDown[term]
	}
	return noDown[term]
}
