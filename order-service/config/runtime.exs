import Config

jwt_secret =
  System.get_env("JWT_SECRET") ||
    raise "environment variable JWT_SECRET is missing."

config :order_service, :jwt_secret, jwt_secret

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise "environment variable DATABASE_URL is missing."

  config :order_service, OrderService.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "environment variable SECRET_KEY_BASE is missing."

  port = String.to_integer(System.get_env("PORT") || "3004")

  config :order_service, OrderServiceWeb.Endpoint,
    server: true,
    http: [ip: {0, 0, 0, 0}, port: port],
    secret_key_base: secret_key_base
end
