package router

import (
	"user-service/src/router/routes"

	"github.com/gorilla/mux"
)

// GenarateRouter vai retornar um router com a rota de usuário configurada
func GenarateRouter() *mux.Router {
	r := mux.NewRouter()
	r.StrictSlash(true)
	routes.Configure(r)
	return r
}
