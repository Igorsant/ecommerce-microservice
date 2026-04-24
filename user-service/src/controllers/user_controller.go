package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"user-service/src/database"
	"user-service/src/models"
	"user-service/src/responses"

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

func CreateUser(w http.ResponseWriter, r *http.Request) {
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

	err = db.QueryRow(
		context.Background(),
		`INSERT INTO users (name, phone) 
		 VALUES ($1, $2) 
		 RETURNING id, created_at`,
		user.Name,
		user.Phone,
	).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		responses.ERR(w, http.StatusInternalServerError, err)
		return
	}

	responses.JSON(w, http.StatusCreated, user)
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

	userID, _ := strconv.ParseUint(id, 10, 64)
	user.ID = userID

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
