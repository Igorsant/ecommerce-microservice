defmodule OrderService.ProductServiceClient do
  def update_stock(product_id, quantity_change, correlation_id, token) do
    base_url = Application.fetch_env!(:order_service, :product_service_url)
    headers = [{"x-correlation-id", correlation_id}, {"authorization", "Bearer #{token}"}]

    case Req.patch("#{base_url}/products/#{product_id}/stock",
           json: %{"quantityChange" => quantity_change},
           headers: headers
         ) do
      {:ok, %{status: 200}} -> :ok
      {:ok, %{status: 404}} -> {:error, :not_found}
      _ -> {:error, :service_unavailable}
    end
  end

  def get_product(product_id, correlation_id, token) do
    base_url = Application.fetch_env!(:order_service, :product_service_url)

    headers = [{"x-correlation-id", correlation_id}, {"authorization", "Bearer #{token}"}]

    case Req.get("#{base_url}/products/#{product_id}", headers: headers) do
      {:ok, %{status: 200, body: product}} -> {:ok, product}
      {:ok, %{status: 404}} -> {:error, :not_found}
      _ -> {:error, :service_unavailable}
    end
  end
end
