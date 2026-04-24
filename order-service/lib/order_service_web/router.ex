defmodule OrderServiceWeb.Router do
  use Phoenix.Router, helpers: false

  pipeline :api do
    plug :accepts, ["json"]
    plug OrderServiceWeb.Plugs.Auth
  end

  pipeline :public do
    plug :accepts, ["json"]
  end

  scope "/", OrderServiceWeb do
    pipe_through :public

    get "/health", HealthController, :index
  end

  scope "/", OrderServiceWeb do
    pipe_through :api

    resources "/orders", OrderController, except: [:new, :edit] do
      resources "/items", OrderItemController, except: [:new, :edit]
    end
  end
end
