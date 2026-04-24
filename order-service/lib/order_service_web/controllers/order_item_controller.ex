defmodule OrderServiceWeb.OrderItemController do
  use Phoenix.Controller, formats: [:json]
  alias OrderService.Orders
  alias OrderService.Orders.OrderItem

  action_fallback OrderServiceWeb.FallbackController

  def index(conn, %{"order_id" => order_id}) do
    items = Orders.list_order_items(order_id)
    render(conn, :index, order_items: items)
  end

  def create(conn, %{"order_id" => order_id, "order_item" => item_params}) do
    params = Map.put(item_params, "order_id", order_id)

    with {:ok, %OrderItem{} = item} <- Orders.create_order_item(params) do
      conn
      |> put_status(:created)
      |> render(:show, order_item: item)
    end
  end

  def show(conn, %{"id" => id}) do
    item = Orders.get_order_item!(id)
    render(conn, :show, order_item: item)
  end

  def update(conn, %{"id" => id, "order_item" => item_params}) do
    item = Orders.get_order_item!(id)

    with {:ok, %OrderItem{} = item} <- Orders.update_order_item(item, item_params) do
      render(conn, :show, order_item: item)
    end
  end

  def delete(conn, %{"id" => id}) do
    item = Orders.get_order_item!(id)

    with {:ok, %OrderItem{}} <- Orders.delete_order_item(item) do
      send_resp(conn, :no_content, "")
    end
  end
end
