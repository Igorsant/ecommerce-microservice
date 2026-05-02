package middlewares

import (
	"context"
	"log"
	"net/http"
	"user-service/src/authentication"
	"user-service/src/responses"

	"github.com/google/uuid"
)

// CorrelationID reads x-correlation-id from the request header, generates one if absent,
// stores it in context, and echoes it in the response header.
func CorrelationID(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		correlationID := r.Header.Get("x-correlation-id")
		if correlationID == "" {
			correlationID = uuid.New().String()
		}
		w.Header().Set("x-correlation-id", correlationID)
		ctx := context.WithValue(r.Context(), "correlationID", correlationID)
		next(w, r.WithContext(ctx))
	}
}

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
