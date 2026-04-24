defmodule OrderService.Orders do
  import Ecto.Query
  alias OrderService.Repo
  alias OrderService.Orders.{Order, OrderItem}

  # Orders

  def list_orders do
    Repo.all(Order)
  end

  def get_order!(id), do: Repo.get!(Order, id)

  def get_order_with_items!(id) do
    Order
    |> Repo.get!(id)
    |> Repo.preload(:order_items)
  end

  def create_order(attrs \\ %{}) do
    %Order{}
    |> Order.changeset(attrs)
    |> Repo.insert()
  end

  def update_order(%Order{} = order, attrs) do
    order
    |> Order.changeset(attrs)
    |> Repo.update()
  end

  def delete_order(%Order{} = order), do: Repo.delete(order)

  # Order Items

  def list_order_items(order_id) do
    OrderItem
    |> where([i], i.order_id == ^order_id)
    |> Repo.all()
  end

  def get_order_item!(id), do: Repo.get!(OrderItem, id)

  def create_order_item(attrs \\ %{}) do
    %OrderItem{}
    |> OrderItem.changeset(attrs)
    |> Repo.insert()
  end

  def update_order_item(%OrderItem{} = item, attrs) do
    item
    |> OrderItem.changeset(attrs)
    |> Repo.update()
  end

  def delete_order_item(%OrderItem{} = item), do: Repo.delete(item)
end
