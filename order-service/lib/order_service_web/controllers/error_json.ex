defmodule OrderServiceWeb.ErrorJSON do
  def render("400.json", _assigns), do: %{errors: %{detail: "Bad Request"}}
  def render("404.json", _assigns), do: %{errors: %{detail: "Not Found"}}
  def render("500.json", _assigns), do: %{errors: %{detail: "Internal Server Error"}}
  def render("503.json", _assigns), do: %{errors: %{detail: "Service Unavailable"}}
end
