import Config

config :order_service, OrderService.Repo,
  username: System.get_env("POSTGRES_USER", "postgres"),
  password: System.get_env("POSTGRES_PASSWORD", "postgres"),
  hostname: System.get_env("POSTGRES_HOST", "localhost"),
  database: "order_db",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :order_service, OrderServiceWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: 3004],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "dev_secret_key_base_at_least_64_chars_long_for_order_service_dev"

config :order_service, :jwt_secret, System.get_env("JWT_SECRET", "dev_jwt_secret_change_me")

config :logger, :console, format: "[$level] $message\n"
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime
