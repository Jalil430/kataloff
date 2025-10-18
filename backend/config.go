package main

import (
	"log"
	"os"
)

var (
	PORT            = "8080"
	DB_DSN          string
	DefaultWhatsApp string
)

func LoadConfig() {
	if p := os.Getenv("PORT"); p != "" {
		PORT = p
	}
	DB_DSN = os.Getenv("DB_DSN")
	if DB_DSN == "" {
		log.Fatal("❌ DB_DSN не указан в .env")
	}

	DefaultWhatsApp = os.Getenv("WHATSAPP_NUMBER")
	if DefaultWhatsApp == "" {
		log.Println("⚠️  WHATSAPP_NUMBER не указан — используется тестовый")
		DefaultWhatsApp = "79991234567"
	}
}
