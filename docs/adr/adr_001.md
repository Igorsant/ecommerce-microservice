# Architecture Decision Record (ADR)

## ADR 01: Instância Única de Banco de Dados com Segregação Lógica

**Data:** 24 de Abril de 2026  
**Status:** Aceito  
**Revisores:** Time do projeto

---

### Contexto e Problema
No desenvolvimento do ecossistema de microsserviços para o E-commerce, precisamos definir a estratégia de persistência para os serviços de `Auth`, `Product`, `Order`, `User` e demais módulos. O desafio é equilibrar o princípio de isolamento de dados (essencial em microsserviços) com as restrições de hardware do ambiente de desenvolvimento (consumo de RAM e CPU) e a necessidade de simplificar a orquestração inicial do Docker Compose.

### Alternativas Consideradas

1. **Instâncias Independentes (Contêineres Separados):** - Um contêiner PostgreSQL dedicado para cada microsserviço.
   - *Motivo do descarte:* Elevado consumo de memória RAM ao rodar múltiplos processos do banco simultaneamente e maior complexidade na gestão de volumes e portas.

2. **Banco de Dados Único (Schema Único):** - Todos os serviços salvando na mesma base de dados e nas mesmas tabelas.
   - *Motivo do descarte:* Violação direta do isolamento; cria alto acoplamento de dados, dificultando a evolução independente dos serviços e colocando em risco a integridade do sistema.

### Decisão
Optamos por uma **Abordagem Híbrida**: utilizar uma **única instância de banco de dados (PostgreSQL)**, porém com **segregação lógica total**. 
- Criamos bancos de dados distintos (`auth_db`, `product_db`, etc.) dentro do mesmo processo Postgres.
- Cada microsserviço possui sua própria string de conexão exclusiva, garantindo que a aplicação só visualize e manipule os dados de seu próprio domínio.

### Consequências

**Positivas:**
* **Eficiência de Recursos:** Redução do overhead de memória, permitindo rodar o ambiente completo em máquinas com menos RAM.
* **Facilidade de Gestão:** Centralização de backups, logs de auditoria e manutenção da infraestrutura de banco de dados.
* **Isolamento de Dados:** Mantém a autonomia lógica; um serviço não consegue acessar as tabelas do outro via aplicação (privilégios de acesso separados).

**Negativas:**
* **Ponto Único de Falha (SPOF):** Se a instância única do Postgres cair, todos os microsserviços perdem a persistência simultaneamente.
* **Disputa de Recursos (I/O):** Um serviço com carga excessiva de leitura/escrita pode degradar a performance dos demais serviços hospedados na mesma instância.
