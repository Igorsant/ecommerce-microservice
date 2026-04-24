defmodule OrderServiceWeb.OrderJSON do
  alias OrderService.Orders.Order

  def index(%{orders: orders}), do: %{data: Enum.map(orders, &data/1)}
  def show(%{order: order}), do: %{data: data(order)}

  defp data(%Order{} = order) do
    %{
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.inserted_at,
      order_items: items(order)
    }
  end

  defp items(%Order{order_items: items}) when is_list(items),
    do: Enum.map(items, &OrderServiceWeb.OrderItemJSON.item_data/1)

  defp items(_), do: nil
end
