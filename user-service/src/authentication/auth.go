package authentication

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"user-service/src/config"

	jwt "github.com/dgrijalva/jwt-go"
)

// ValidateToken verifica se o token pasado na requisição é válido
func ValidateToken(r *http.Request) (jwt.MapClaims, error) {
	tokenString := extractToken(r)

	if tokenString == "" {
		return nil, errors.New("token não informado")
	}

	token, err := jwt.Parse(tokenString, returnVerificationKey)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("token inválido")
	}

	return claims, nil
}

func extractToken(r *http.Request) string {
	token := r.Header.Get("Authorization")

	if len(strings.Split(token, " ")) == 2 {
		return strings.Split(token, " ")[1]
	}

	return ""
}

func returnVerificationKey(token *jwt.Token) (interface{}, error) {
	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, fmt.Errorf("método de assinatura inesperado! %v", token.Header["alg"])
	}

	return config.SecretKey, nil
}
