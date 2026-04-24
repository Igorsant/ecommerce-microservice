package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

var DB *pgx.Conn

func Connect() {
	url := os.Getenv("DATABASE_URL")

	conn, err := pgx.Connect(context.Background(), url)
	if err != nil {
		log.Fatal("Erro ao conectar:", err)
	}

	DB = conn
}
