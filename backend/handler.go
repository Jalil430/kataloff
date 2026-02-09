package main

import (
	"encoding/json"
	"net/http"
)

func calcHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	var req CalcRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	// Поручитель обязателен для всех расчётов.
	req.HasGuarantor = true

	resp, err := compute(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	DB.Exec(`INSERT INTO calculations
	(product_name, price, term, has_guarantor, has_down, down_percent,
	 down_payment, monthly_payment, total)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		req.ProductName, req.Price, req.Term, req.HasGuarantor, req.HasDown,
		req.DownPercent, resp.DownPayment, resp.MonthlyPayment, resp.Total)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func numberHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"number": DefaultWhatsApp})
}
