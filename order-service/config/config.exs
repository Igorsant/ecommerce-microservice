import Config

config :order_service, OrderServiceWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: OrderServiceWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: OrderService.PubSub,
  live_view: [signing_salt: "order_service"]

config :order_service,
  ecto_repos: [OrderService.Repo]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
