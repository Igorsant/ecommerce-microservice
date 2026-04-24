defmodule OrderServiceWeb.Plugs.Auth do
  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- verify_token(token),
         :ok <- check_expiry(claims) do
      assign(conn, :current_user, claims)
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})
        |> halt()
    end
  end

  defp verify_token(token) do
    secret = Application.fetch_env!(:order_service, :jwt_secret)
    signer = Joken.Signer.create("HS256", secret)
    Joken.verify(token, signer)
  end

  defp check_expiry(%{"exp" => exp}) do
    if System.system_time(:second) < exp, do: :ok, else: {:error, :token_expired}
  end

  defp check_expiry(_), do: :ok
end
