package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Загружаем .env
	_ = godotenv.Load()
	LoadConfig()
	InitDB()

	// Регистрируем обработчики API
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calc", calcHandler)
	mux.HandleFunc("/api/number", numberHandler)

	// Настраиваем CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://kataloff-if.ru",
			"https://kataloff-if.ru",
			"http://45.141.102.60",
			"http://localhost:5173", // можно оставить для разработки
		},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization", "Accept"},
	})

	// Оборачиваем сервер в CORS middleware
	handler := c.Handler(mux)

	log.Printf("📞 WhatsApp: %s", DefaultWhatsApp)
	log.Printf("🚀 Сервер запущен на :%s", PORT)

	// Запускаем HTTP сервер
	log.Fatal(http.ListenAndServe(":"+PORT, handler))
}
