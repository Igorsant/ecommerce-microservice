defmodule OrderService.Orders.Order do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "orders" do
    field :user_id, :binary_id
    field :status, Ecto.Enum, values: [:pending, :paid, :cancelled], default: :pending
    field :total_amount, :decimal

    has_many :order_items, OrderService.Orders.OrderItem

    timestamps(updated_at: false)
  end

  def changeset(order, attrs) do
    order
    |> cast(attrs, [:user_id, :status, :total_amount])
    |> validate_required([:user_id, :total_amount])
    |> validate_number(:total_amount, greater_than_or_equal_to: 0)
  end
end
