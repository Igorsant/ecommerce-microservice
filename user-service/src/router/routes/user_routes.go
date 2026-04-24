package routes

import (
	"net/http"
	"user-service/src/controllers"
)

var userRoutes = []Route{
	{
		URI:                   "/health",
		Method:                http.MethodGet,
		Function:              controllers.Health,
		RequireAuthentication: true,
	},
	{
		URI:                   "/users",
		Method:                http.MethodPost,
		Function:              controllers.CreateUser,
		RequireAuthentication: true,
	},
	{
		URI:                   "/users",
		Method:                http.MethodGet,
		Function:              controllers.GetUsers,
		RequireAuthentication: true,
	},
	{
		URI:                   "/users/{userID}",
		Method:                http.MethodGet,
		Function:              controllers.GetUserByID,
		RequireAuthentication: true,
	},
	{
		URI:                   "/users/{userID}",
		Method:                http.MethodPut,
		Function:              controllers.UpdateUser,
		RequireAuthentication: true,
	},
	{
		URI:                   "/users/{userID}",
		Method:                http.MethodDelete,
		Function:              controllers.DeleteUser,
		RequireAuthentication: true,
	},
}
