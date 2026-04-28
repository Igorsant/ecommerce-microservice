package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"user-service/src/authentication"
	"user-service/src/database"
	"user-service/src/dto"
	"user-service/src/models"
	"user-service/src/responses"
	"user-service/src/security"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx"
)

func Health(w http.ResponseWriter, r *http.Request) {
	err := database.DB.Ping(context.Background())
	if err != nil {
		http.Error(w, "DB DOWN", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func Login(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		responses.ERR(w, http.StatusUnprocessableEntity, err)
		return
	}

	var req dto.LoginRequest
	if err = json.Unmarshal(body, &req); err != nil {
		responses.ERR(w, http.StatusBadRequest, err)
		return
	}

	db := database.DB

	var userID string
	var hash string

	err = db.QueryRow(
		context.Background(),
		`SELECT id, password FROM auth_users WHERE email = $1`,
		req.Email,
	).Scan(&userID, &hash)

	if err != nil {
		if err == pgx.ErrNoRows {
			responses.ERR(w, http.StatusUnauthorized, fmt.Errorf("email ou senha inválidos"))
			return
		}
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	err = security.CheckPassword(hash, req.Password)
	if err != nil {
		responses.ERR(w, http.StatusUnauthorized, fmt.Errorf("email ou senha inválidos"))
		return
	}

	token, err := authentication.GenerateToken(userID)
	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	responses.JSON(w, http.StatusOK, map[string]string{
		"token": token,
	})
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	bodyRequest, err := io.ReadAll(r.Body)
	if err != nil {
		responses.ERR(w, http.StatusUnprocessableEntity, err)
		return
	}

	var req dto.CreateUserRequest
	if err = json.Unmarshal(bodyRequest, &req); err != nil {
		responses.ERR(w, http.StatusBadRequest, err)
		return
	}

	userID := uuid.New().String()

	db := database.DB

	tx, err := db.Begin(context.Background())
	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}
	defer tx.Rollback(context.Background())

	_, err = tx.Exec(
		context.Background(),
		`INSERT INTO users (id, name, phone)
		 VALUES ($1, $2, $3)`,
		userID,
		req.Name,
		req.Phone,
	)
	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	hash, err := security.Hash(req.Password)
	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	_, err = tx.Exec(
		context.Background(),
		`INSERT INTO auth_users (id, email, password)
		 VALUES ($1, $2, $3)`,
		userID,
		req.Email,
		string(hash),
	)
	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	if err = tx.Commit(context.Background()); err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	response := models.User{
		ID:    userID,
		Name:  req.Name,
		Phone: req.Phone,
	}

	responses.JSON(w, http.StatusCreated, response)
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	db := database.DB

	rows, err := db.Query(context.Background(), `
		SELECT id, name, phone, created_at FROM users
	`)
	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User

		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Phone,
			&user.CreatedAt,
		); err != nil {
			responses.ERR(w, http.StatusInternalServerError, err)
			return
		}

		users = append(users, user)
	}

	responses.JSON(w, http.StatusOK, users)
}

func GetUserByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["userID"]

	db := database.DB

	var user models.User

	err := db.QueryRow(
		context.Background(),
		`SELECT id, name, phone, created_at 
		 FROM users 
		 WHERE id = $1`,
		id,
	).Scan(
		&user.ID,
		&user.Name,
		&user.Phone,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			responses.ERR(w, http.StatusNotFound, err)
			return
		}
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	responses.JSON(w, http.StatusOK, user)
}

func GetAuthUserByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["userID"]

	db := database.DB

	var authUser models.AuthUser

	err := db.QueryRow(
		context.Background(),
		`SELECT id, email, password, created_at 
		 FROM auth_users 
		 WHERE id = $1`,
		id,
	).Scan(
		&authUser.ID,
		&authUser.Email,
		&authUser.Password,
		&authUser.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			responses.ERR(w, http.StatusNotFound, err)
			return
		}
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	responses.JSON(w, http.StatusOK, authUser)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["userID"]

	bodyRequest, err := io.ReadAll(r.Body)
	if err != nil {
		responses.ERR(w, http.StatusUnprocessableEntity, err)
		return
	}

	var user models.User
	if err = json.Unmarshal(bodyRequest, &user); err != nil {
		responses.ERR(w, http.StatusBadRequest, err)
		return
	}

	db := database.DB

	_, err = db.Exec(
		context.Background(),
		`UPDATE users 
		 SET name = $1, phone = $2 
		 WHERE id = $3`,
		user.Name,
		user.Phone,
		id,
	)

	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	user.ID = id

	responses.JSON(w, http.StatusOK, user)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["userID"]

	db := database.DB

	commandTag, err := db.Exec(
		context.Background(),
		`DELETE FROM users WHERE id = $1`,
		id,
	)

	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	if commandTag.RowsAffected() == 0 {
		responses.ERR(w, http.StatusNotFound, fmt.Errorf("usuário não encontrado"))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
