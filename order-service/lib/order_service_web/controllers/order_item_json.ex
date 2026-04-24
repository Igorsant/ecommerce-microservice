defmodule OrderServiceWeb.OrderItemJSON do
  alias OrderService.Orders.OrderItem

  def index(%{order_items: items}), do: %{data: Enum.map(items, &item_data/1)}
  def show(%{order_item: item}), do: %{data: item_data(item)}

  def item_data(%OrderItem{} = item) do
    %{
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }
  end
end
