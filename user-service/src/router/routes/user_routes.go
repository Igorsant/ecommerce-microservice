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
		RequireAuthentication: false,
	},
	{
		URI:                   "/login",
		Method:                http.MethodPost,
		Function:              controllers.Login,
		RequireAuthentication: false,
	},
	{
		URI:                   "/users",
		Method:                http.MethodPost,
		Function:              controllers.CreateUser,
		RequireAuthentication: false,
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
		URI:                   "/auth-users/{userID}",
		Method:                http.MethodGet,
		Function:              controllers.GetAuthUserByID,
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
