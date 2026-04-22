package main

import (
	"fmt"
	"log"
	"net/http"
	"user-service/src/config"
	"user-service/src/database"
	"user-service/src/router"

	"github.com/rs/cors"
)

func main() {
	config.Load()
	database.Connect()
	r := router.GenarateRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	fmt.Printf("Escutando na porta %d\n", config.Port)

	log.Fatal(http.ListenAndServe(":3002", handler))

}
