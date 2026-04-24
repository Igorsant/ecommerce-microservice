defmodule OrderService.Repo.Migrations.CreateOrderItems do
  use Ecto.Migration

  def change do
    create table(:order_items, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :order_id, references(:orders, type: :binary_id, on_delete: :delete_all), null: false
      add :product_id, :binary_id, null: false
      add :quantity, :integer, null: false
      add :price, :decimal, null: false
    end

    create index(:order_items, [:order_id])
    create index(:order_items, [:product_id])
  end
end
