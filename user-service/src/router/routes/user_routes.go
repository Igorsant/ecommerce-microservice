package routes

import (
	"net/http"
	"user-service/src/controllers"
)

var userRoutes = []Route{
	{
		URI:                   "/",
		Method:                http.MethodPost,
		Function:              controllers.CreateUser,
		RequireAuthentication: false,
	},
	{
		URI:                   "/",
		Method:                http.MethodGet,
		Function:              controllers.GetUsers,
		RequireAuthentication: false,
	},
	{
		URI:                   "/{userID}",
		Method:                http.MethodGet,
		Function:              controllers.GetUserByID,
		RequireAuthentication: false,
	},
	{
		URI:                   "/{userID}",
		Method:                http.MethodPut,
		Function:              controllers.UpdateUser,
		RequireAuthentication: false,
	},
	{
		URI:                   "/{userID}",
		Method:                http.MethodDelete,
		Function:              controllers.DeleteUser,
		RequireAuthentication: false,
	},
}
