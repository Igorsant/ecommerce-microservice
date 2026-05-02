defmodule OrderService.Orders do
  import Ecto.Query
  alias OrderService.Repo
  alias OrderService.Orders.{Order, OrderItem}

  # Orders

  def list_orders do
    Order
    |> Repo.all()
    |> Repo.preload(:order_items)
  end

  def get_order!(id), do: Repo.get!(Order, id)

  def get_order_with_items!(id) do
    Order
    |> Repo.get!(id)
    |> Repo.preload(:order_items)
  end

  def get_order_with_items(id) do
    case Repo.get(Order, id) do
      nil -> nil
      order -> Repo.preload(order, :order_items)
    end
  end

  def create_order(attrs \\ %{}) do
    %Order{}
    |> Order.changeset(attrs)
    |> Repo.insert()
  end

  def create_order_with_items(attrs \\ %{}, correlation_id, token) do
    {items_attrs, order_attrs} = Map.pop(attrs, "items", [])

    with {:ok, items_with_price} <- fetch_prices(items_attrs, correlation_id, token) do
      total_amount = Enum.reduce(items_with_price, Decimal.new(0), fn item, acc ->
        Decimal.add(acc, Decimal.mult(item["price"], Decimal.new(item["quantity"])))
      end)

      order_attrs = Map.put(order_attrs, "total_amount", total_amount)

      Ecto.Multi.new()
      |> Ecto.Multi.insert(:order, Order.changeset(%Order{}, order_attrs))
      |> Ecto.Multi.run(:order_items, fn _repo, %{order: order} ->
        Enum.reduce_while(items_with_price, {:ok, []}, fn item_attrs, {:ok, acc} ->
          case create_order_item(Map.put(item_attrs, "order_id", order.id)) do
            {:ok, item} -> {:cont, {:ok, [item | acc]}}
            {:error, changeset} -> {:halt, {:error, changeset}}
          end
        end)
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{order: order, order_items: items}} -> {:ok, %{order | order_items: items}}
        {:error, :order, changeset, _} -> {:error, changeset}
        {:error, :order_items, changeset, _} -> {:error, changeset}
      end
    end
  end

  defp fetch_prices(items_attrs, correlation_id, token) do
    Enum.reduce_while(items_attrs, {:ok, []}, fn item_attrs, {:ok, acc} ->
      case OrderService.ProductServiceClient.get_product(item_attrs["product_id"], correlation_id, token) do
        {:ok, product} ->
          item = Map.put(item_attrs, "price", product["price"])
          {:cont, {:ok, [item | acc]}}
        {:error, reason} ->
          {:halt, {:error, reason}}
      end
    end)
  end

  def mark_order_paid(order_id, correlation_id, token) do
    case get_order_with_items(order_id) do
      nil ->
        {:error, :not_found}

      order ->
        with {:ok, updated_order} <- update_order(order, %{"status" => "paid"}) do
          Enum.each(order.order_items, fn item ->
            case OrderService.ProductServiceClient.update_stock(item.product_id, -item.quantity, correlation_id, token) do
              :ok ->
                :ok

              {:error, reason} ->
                require Logger
                Logger.error("Failed to update stock for product #{item.product_id}: #{inspect(reason)}, correlation_id=#{correlation_id}")
            end
          end)

          {:ok, %{updated_order | order_items: order.order_items}}
        end
    end
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
