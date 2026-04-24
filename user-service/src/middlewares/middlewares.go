package middlewares

import (
	"context"
	"log"
	"net/http"
	"user-service/src/authentication"
	"user-service/src/responses"
)

// Logger escreve informações da requisição no terminal
func Logger(nextFunction http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("\n %s %s %s", r.Method, r.RequestURI, r.Host)
		nextFunction(w, r)
	}
}

// Authenticate verifica se o usuário está autenticado
func Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, err := authentication.ValidateToken(r)
		if err != nil {
			responses.ERR(w, http.StatusUnauthorized, err)
			return
		}

		ctx := context.WithValue(r.Context(), "user", claims)

		next(w, r.WithContext(ctx))
	}
}
