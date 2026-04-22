package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var (
	DBConnectionString = ""
	Port               = 0
)

func Load() {
	var err error

	if err = godotenv.Load(); err != nil {
		log.Println("Aviso: .env não encontrado")
	}

	DBConnectionString = os.Getenv("DATABASE_URL")

	Port, err = strconv.Atoi(os.Getenv("PORT"))
	if err != nil {
		Port = 3002
	}
}
