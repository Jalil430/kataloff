package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
    _ = godotenv.Load()
    LoadConfig()
    InitDB()

    mux := http.NewServeMux()
    mux.HandleFunc("/api/calc", calcHandler)
    mux.HandleFunc("/api/number", numberHandler)

    handler := cors.New(cors.Options{
        AllowedOrigins:   []string{"*"},
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type"},
        AllowCredentials: true,
    }).Handler(mux)

    log.Printf("📞 WhatsApp: %s", DefaultWhatsApp)
    log.Printf("🚀 Сервер на :%s", PORT)
    log.Fatal(http.ListenAndServe(":"+PORT, handler))
}

