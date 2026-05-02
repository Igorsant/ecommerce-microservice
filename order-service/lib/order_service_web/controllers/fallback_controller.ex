defmodule OrderServiceWeb.FallbackController do
  use Phoenix.Controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: OrderServiceWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: OrderServiceWeb.ErrorJSON)
    |> render(:"404")
  end

  def call(conn, {:error, :bad_request}) do
    conn
    |> put_status(:bad_request)
    |> put_view(json: OrderServiceWeb.ErrorJSON)
    |> render(:"400")
  end

  def call(conn, {:error, :service_unavailable}) do
    conn
    |> put_status(:service_unavailable)
    |> put_view(json: OrderServiceWeb.ErrorJSON)
    |> render(:"503")
  end
end
