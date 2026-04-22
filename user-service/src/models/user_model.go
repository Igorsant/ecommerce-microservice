package models

import "time"

type User struct {
	ID        uint64    `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	Phone     string    `json:"phone,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
}
