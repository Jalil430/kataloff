package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("postgres", DB_DSN)
	if err != nil {
		log.Fatalf("❌ Ошибка подключения к PostgreSQL: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("❌ PostgreSQL не отвечает: %v", err)
	}

	log.Println("✅ Подключено к PostgreSQL")

	// применяем SQL-модель
	sqlBytes, err := os.ReadFile("database.sql")
	if err != nil {
		log.Printf("⚠️ Файл database.sql не найден, пропускаем инициализацию схемы: %v", err)
		return
	}

	if _, err = DB.Exec(string(sqlBytes)); err != nil {
		log.Fatalf("❌ Ошибка применения SQL схемы: %v", err)
	}
	fmt.Println("📦 Схема БД применена")
}
