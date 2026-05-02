defmodule OrderServiceWeb.OrderController do
  use Phoenix.Controller, formats: [:json]
  alias OrderService.Orders
  alias OrderService.Orders.Order

  action_fallback OrderServiceWeb.FallbackController

  def index(conn, _params) do
    orders = Orders.list_orders()
    render(conn, :index, orders: orders)
  end

  def create(conn, %{"order" => order_params}) do
    %{"userID" => user_id} = conn.assigns.current_user
    order_params = Map.put(order_params, "user_id", user_id)

    with {:ok, %Order{} = order} <- Orders.create_order_with_items(order_params, conn.assigns.correlation_id, conn.assigns.token) do
      conn
      |> put_status(:created)
      |> render(:show, order: order)
    end
  end

  def create(conn, _params), do: {:error, :bad_request}

  def show(conn, %{"id" => id}) do
    order = Orders.get_order_with_items!(id)
    render(conn, :show, order: order)
  end

  def update(conn, %{"id" => id, "order" => order_params}) do
    order = Orders.get_order!(id)

    with {:ok, %Order{} = order} <- Orders.update_order(order, order_params) do
      render(conn, :show, order: order)
    end
  end

  def mark_as_paid(conn, %{"order_id" => id}) do
    with {:ok, %Order{} = order} <- Orders.mark_order_paid(id, conn.assigns.correlation_id, conn.assigns.token) do
      render(conn, :show, order: order)
    end
  end

  def delete(conn, %{"id" => id}) do
    order = Orders.get_order!(id)

    with {:ok, %Order{}} <- Orders.delete_order(order) do
      send_resp(conn, :no_content, "")
    end
  end
end
