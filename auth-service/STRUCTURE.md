# Auth Service - Estrutura de Projeto

## 📁 Organização Completa

```
auth-service/
├── src/
│   ├── main.ts                          # 🚀 Entrada da aplicação (Express setup)
│   ├── config/
│   │   └── database.ts                  # 🗄️  Configuração Prisma + graceful shutdown
│   ├── controllers/
│   │   └── userController.ts            # 🎮 Controladores HTTP dos endpoints
│   ├── services/
│   │   ├── userService.ts               # 💼 Lógica de negócio (criar, buscar, deletar)
│   │   └── userServiceClient.ts         # 🔗 Cliente para comunicação com User Service
│   ├── routes/
│   │   └── userRoutes.ts                # 🛣️  Definição de rotas
│   ├── middleware/
│   │   ├── correlationId.ts             # 🆔 Middleware de Correlation ID
│   │   └── errorHandler.ts              # ⚠️  Middleware de tratamento de erros
│   └── utils/
│       └── logger.ts                    # 📝 Logger estruturado com Pino
├── prisma/
│   ├── schema.prisma                    # 📋 Schema do banco de dados
│   └── migrations/
│       └── 0_init/
│           └── migration.sql            # 🔄 SQL de criação da tabela users
├── dist/                                # 📦 Código compilado (gerado)
├── node_modules/                        # 📚 Dependências (gerado)
├── package.json                         # 📦 Dependências e scripts
├── package-lock.json                    # 🔒 Lock de versões (gerado)
├── tsconfig.json                        # ⚙️  Configuração TypeScript
├── .env                                 # 🔐 Variáveis de ambiente
├── .gitignore                           # 🚫 Arquivos a ignorar no Git
├── .dockerignore                        # 🐳 Arquivos a ignorar no Docker
└── Dockerfile                           # 🐳 Imagem Docker
```

---

## 📚 Descrição dos Arquivos Principais

### **src/main.ts** - Entrada da Aplicação
- Configuração do Express
- Middleware (CORS, JSON, Logging, Correlation ID)
- Rotas de health check e users
- Error handlers

### **src/config/database.ts** - Configuração Prisma
- Inicialização do Prisma Client
- Graceful shutdown (SIGINT/SIGTERM)
- Gerenciamento de conexão

### **src/services/userService.ts** - Lógica de Negócio
- `createUser()` - Cria usuário com bcryptjs
- `getUserById()` - Busca usuário por ID
- `deleteUser()` - Deleta usuário
- Logging estruturado

### **src/services/userServiceClient.ts** - Cliente HTTP
- `notifyUserCreated()` - Notifica User Service de nova criação
- `notifyUserDeleted()` - Notifica User Service de deleção
- Tratamento de erros com retry

### **src/controllers/userController.ts** - Endpoints HTTP
- `createUser()` - POST /cadastro (com rollback em erro)
- `getUser()` - GET /user/:id
- `deleteUser()` - DELETE /user/:id
- Validação de entrada

### **src/routes/userRoutes.ts** - Definição de Rotas
- POST /cadastro
- GET /user/:id
- DELETE /user/:id

### **src/middleware/correlationId.ts** - Correlation ID
- Gera UUID para rastreabilidade
- Propaga em headers HTTP
- Disponível em req.correlationId

### **src/middleware/errorHandler.ts** - Tratamento de Erros
- Centraliza tratamento de exceções
- Logging estruturado de erros
- Handler 404 para rotas não encontradas

### **src/utils/logger.ts** - Logger Estruturado
- Pino para logging estruturado
- Modo desenvolvimento com pino-pretty
- Modo produção com formato JSON

---

## 🚀 Endpoints Implementados

### **POST /cadastro** - Criar Usuário
```json
Entrada:  { "email": "user@example.com", "password": "senha123" }
Saída:    { "id": "uuid", "email": "...", "createdAt": "timestamp", "correlationId": "uuid" }
Status:   201 Created / 400 Bad Request / 409 Conflict / 503 Service Unavailable
```

### **GET /user/:id** - Buscar Usuário
```json
Saída:    { "id": "uuid", "email": "...", "createdAt": "timestamp", "correlationId": "uuid" }
Status:   200 OK / 404 Not Found
```

### **DELETE /user/:id** - Deletar Usuário
```json
Status:   204 No Content / 404 Not Found
```

### **GET /health** - Health Check
```json
Saída:    { "status": "ok", "timestamp": "...", "service": "auth-service", "correlationId": "uuid" }
Status:   200 OK / 503 Service Unavailable
```

---

## 🔧 Stack Tecnológico

- **Runtime**: Node.js 18 LTS (Alpine)
- **Linguagem**: TypeScript
- **Framework Web**: Express
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Criptografia**: bcryptjs
- **Logging**: Pino + pino-http + pino-pretty
- **HTTP Client**: Axios
- **CORS**: cors
- **Variáveis de Ambiente**: dotenv

---

## 📊 Banco de Dados

### Tabela: users
```sql
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Segurança Implementada

✅ Hashing de senha com bcryptjs (10 rounds)
✅ Validação de entrada
✅ Correlation ID para auditoria
✅ Logging estruturado
✅ Error handler centralizado
✅ CORS configurado
✅ Variáveis sensíveis em .env
✅ Healthcheck do banco de dados

---

## 📝 Variáveis de Ambiente (.env)

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_db
PORT=3001
NODE_ENV=development
USER_SERVICE_URL=http://user-service:3002
LOG_LEVEL=info
```

---

## 🐳 Docker

### Dockerfile - Features
- Multi-stage build com Node.js 18 Alpine
- Executa migrations automaticamente
- Health check configurado
- Build otimizado com .dockerignore

### docker-compose.yml
- PostgreSQL 16 Alpine
- Inicialização automática de BD auth_db
- Auth Service na porta 3001
- Dependência em healthcheck do PostgreSQL

---

## ✅ Checklist de Implementação

- [x] Estrutura de pastas organizada
- [x] TypeScript configurado
- [x] Prisma ORM integrado
- [x] Bcryptjs para hashing de senha
- [x] Logging estruturado com Pino
- [x] Correlation ID middleware
- [x] Error handler centralizado
- [x] POST /cadastro com validação
- [x] Integração com User Service
- [x] Rollback em caso de falha
- [x] GET /user/:id
- [x] DELETE /user/:id com notificação
- [x] GET /health check
- [x] Dockerfile pronto para produção
- [x] Database migrations
- [x] CORS habilitado
- [x] Variáveis de ambiente

---

## 🚀 Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Compilar TypeScript
```bash
npm run build
```

### 3. Modo desenvolvimento
```bash
npm run dev
```

### 4. Subir com Docker Compose (na raiz)
```bash
docker-compose up --build
```

### 5. Testar endpoints
```bash
curl http://localhost:3001/health
curl -X POST http://localhost:3001/cadastro -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"senha123"}'
```

---

**Status**: ✅ Pronto para produção com funcionalidades de logging, segurança e integração com User Service
