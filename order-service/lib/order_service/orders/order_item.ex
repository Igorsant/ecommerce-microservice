defmodule OrderService.Orders.OrderItem do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "order_items" do
    field :product_id, :binary_id
    field :quantity, :integer
    field :price, :decimal

    belongs_to :order, OrderService.Orders.Order
  end

  def changeset(order_item, attrs) do
    order_item
    |> cast(attrs, [:order_id, :product_id, :quantity, :price])
    |> validate_required([:order_id, :product_id, :quantity, :price])
    |> validate_number(:quantity, greater_than: 0)
    |> validate_number(:price, greater_than_or_equal_to: 0)
    |> assoc_constraint(:order)
  end
end
