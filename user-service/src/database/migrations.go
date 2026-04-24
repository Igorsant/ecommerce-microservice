package database

import (
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(dbURL string) {
	m, err := migrate.New(
		"file://migrations",
		dbURL,
	)

	if err != nil {
		log.Fatal("Erro ao iniciar migrate:", err)
	}

	if err := m.Up(); err != nil && err.Error() != "no change" {
		log.Fatal("Erro ao rodar migrations:", err)
	}

	log.Println("Migrations executadas com sucesso")
}
