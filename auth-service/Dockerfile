FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --ignore-scripts && npx prisma generate

# Copiar código-fonte
COPY src ./src

# Build TypeScript
RUN npm run build

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run migrations and start application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
