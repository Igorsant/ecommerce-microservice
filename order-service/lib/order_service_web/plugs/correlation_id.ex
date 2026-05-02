defmodule OrderServiceWeb.Plugs.CorrelationId do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    correlation_id =
      case get_req_header(conn, "x-correlation-id") do
        [value | _] -> value
        [] -> Ecto.UUID.generate()
      end

    conn
    |> assign(:correlation_id, correlation_id)
    |> put_resp_header("x-correlation-id", correlation_id)
  end
end
