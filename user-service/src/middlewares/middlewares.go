package middlewares

import (
	"log"
	"net/http"
)

// Logger escreve informações da requisição no terminal
func Logger(nextFunction http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("\n %s %s %s", r.Method, r.RequestURI, r.Host)
		nextFunction(w, r)
	}
}

// Authenticate verifica se o usuário está autenticado
// func Authenticate(nextFunction http.HandlerFunc) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		if erro := authenticaion.ValidateToken(r); erro != nil {
// 			responses.Erro(w, http.StatusUnauthorized, erro)
// 			return
// 		}
// 		nextFunction(w, r)
// 	}
// }
