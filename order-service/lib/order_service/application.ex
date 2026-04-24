defmodule OrderService.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      OrderService.Repo,
      {Phoenix.PubSub, name: OrderService.PubSub},
      OrderServiceWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: OrderService.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    OrderServiceWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
