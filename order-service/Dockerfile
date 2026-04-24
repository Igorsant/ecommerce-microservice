FROM elixir:1.16-alpine AS build

RUN apk add --no-cache build-base git

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV=prod

COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mix deps.compile

COPY config config
COPY lib lib
COPY priv priv

RUN mix compile
RUN mix release

FROM alpine:3.19 AS runtime

RUN apk add --no-cache libstdc++ openssl ncurses-libs

WORKDIR /app

COPY --from=build /app/_build/prod/rel/order_service ./

ENV PHX_SERVER=true

EXPOSE 3004

CMD bin/order_service eval "OrderService.Release.migrate()" && bin/order_service start
