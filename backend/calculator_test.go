package main

import "testing"

func TestLimitsRaiseAffectedPriceCapsTo100k(t *testing.T) {
	testCases := []struct {
		name      string
		guarantor bool
		down      bool
		wantPrice float64
		wantTerm  int
	}{
		{
			name:      "guarantor without down payment",
			guarantor: true,
			down:      false,
			wantPrice: 100000,
			wantTerm:  10,
		},
		{
			name:      "without guarantor with down payment",
			guarantor: false,
			down:      true,
			wantPrice: 100000,
			wantTerm:  10,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			maxPrice, maxTerm, err := limits(tc.guarantor, tc.down)
			if err != nil {
				t.Fatalf("limits returned error: %v", err)
			}
			if maxPrice != tc.wantPrice {
				t.Fatalf("maxPrice = %v, want %v", maxPrice, tc.wantPrice)
			}
			if maxTerm != tc.wantTerm {
				t.Fatalf("maxTerm = %v, want %v", maxTerm, tc.wantTerm)
			}
		})
	}
}

func TestComputeUsesInstallmentTotalForDownPaymentPercent(t *testing.T) {
	req := CalcRequest{
		Price:        100000,
		Term:         5,
		HasGuarantor: true,
		HasDown:      true,
		DownPercent:  20,
	}

	got, err := compute(req)
	if err != nil {
		t.Fatalf("compute returned error: %v", err)
	}

	const wantDownPayment = 24800
	if got.DownPayment != wantDownPayment {
		t.Fatalf("downPayment = %v, want %v", got.DownPayment, wantDownPayment)
	}
}

func TestComputeRoundsDownPaymentUpToNearest50(t *testing.T) {
	req := CalcRequest{
		Price:        12345,
		Term:         3,
		HasGuarantor: true,
		HasDown:      true,
		DownPercent:  20,
	}

	got, err := compute(req)
	if err != nil {
		t.Fatalf("compute returned error: %v", err)
	}

	const wantDownPayment = 2850
	if got.DownPayment != wantDownPayment {
		t.Fatalf("downPayment = %v, want %v", got.DownPayment, wantDownPayment)
	}
}

func TestComputeUsesExactDownPaymentAmountWhenProvided(t *testing.T) {
	req := CalcRequest{
		Price:        90000,
		Term:         3,
		HasGuarantor: true,
		HasDown:      true,
		DownPercent:  20.007770007770002,
		DownPayment:  20600,
	}

	got, err := compute(req)
	if err != nil {
		t.Fatalf("compute returned error: %v", err)
	}

	if got.DownPayment != 20600 {
		t.Fatalf("downPayment = %v, want %v", got.DownPayment, 20600)
	}
	if got.MonthlyPayment != 27500 {
		t.Fatalf("monthlyPayment = %v, want %v", got.MonthlyPayment, 27500)
	}
	if got.Total != 103100 {
		t.Fatalf("total = %v, want %v", got.Total, 103100)
	}
}
