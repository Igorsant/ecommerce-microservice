defmodule OrderService.Repo.Migrations.CreateOrders do
  use Ecto.Migration

  def change do
    create table(:orders, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, :binary_id, null: false
      add :status, :string, null: false, default: "pending"
      add :total_amount, :decimal, null: false

      timestamps(updated_at: false)
    end

    create index(:orders, [:user_id])
    create index(:orders, [:status])
  end
end
