# ADR 02: Estratégia de identificação de usuários

- Data: 2026-04-24
- Status: Aceito
- Revisor: time do projeto

## Contexto

O ecossistema possui múltiplos serviços em linguagens diferentes e com responsabilidades distintas. O `auth-service` autentica o usuário, emite o token de acesso e centraliza o login. O `order-service` e o `user-service` validam esse token para autorizar chamadas internas e externas.

O desafio é garantir que os serviços consigam referenciar o mesmo usuário sem conflitos e de forma independente. Além disso, precisamos separar claramente duas responsabilidades diferentes:

* **Persistência da identidade do usuário:** o identificador primário do usuário deve ser estável e único em todo o sistema.
* **Identificação em requisições autenticadas:** o serviço deve conseguir reconhecer quem é o usuário logado sem depender de um identificador frágil enviado manualmente pelo cliente.

Hoje, o sistema já utiliza `correlationId` para rastreabilidade, mas esse dado não representa a identidade do usuário. Ele serve apenas para observabilidade e logs distribuídos.

## 2. Alternativas Consideradas

* **A. Chaves Sequenciais (ID: 1, 2, 3):**
	* *Prós:* Simples de implementar e visualmente limpo.
	* *Contras:* Impossível de sincronizar entre bancos de dados diferentes sem causar colisões e expõe o volume de dados do sistema via URL.

* **B. UUID v4 (Universally Unique Identifier):**
	* *Prós:* Identificadores aleatórios de 128 bits que garantem exclusividade global sem necessidade de coordenação central entre os serviços.
	* *Contras:* Maior consumo de armazenamento e leitura menos amigável para humanos.

* **C. Correlation ID como identidade do usuário:**
	* *Prós:* Já existe nos serviços e é útil para rastreamento.
	* *Contras:* Muda a cada requisição, não identifica uma conta e não serve para autorização.

* **D. JWT para autenticação e identificação em requisições:**
	* *Prós:* Permite validar o usuário localmente em cada serviço, sem consulta síncrona ao Auth Service em toda chamada.
	* *Contras:* Exige gerenciamento consistente do segredo e expiração dos tokens.

## 3. Decisão
Decidimos utilizar **UUID v4** como Chave Primária (PK) para a identidade persistida do usuário e **JWT** para autenticação e identificação do usuário autenticado entre os serviços.

### Justificativa:
1. **Consistência Distribuída:** o UUID permite que o *Auth Service* e o *Users Service* referenciem o mesmo usuário sem colisão entre bancos diferentes.
2. **Segurança e Escalabilidade:** evita expor informações sobre o volume de usuários e facilita a evolução da arquitetura.
3. **Autenticação Desacoplada:** o JWT transporta a identidade autenticada do usuário, com o `sub` apontando para o `user.id`, permitindo validação local nos serviços consumidores.
4. **Rastreabilidade Separada:** `correlationId` continua reservado para logs e observabilidade, sem ser usado como identificador de negócio.

## 4. Consequências

### Positivas:
* **Desacoplamento:** os serviços não dependem de uma sequência centralizada de banco de dados nem de um cadastro sincronizado por chave artificial.
* **Rastreabilidade:** facilita a implementação de logs e *Distributed Tracing* com `correlationId`.
* **Padronização:** conformidade com padrões comuns de microserviços, com identidade persistida via UUID e autenticação via JWT.
* **Validação Local:** cada serviço pode validar o token sem depender do Auth Service em cada requisição.

### Negativas:
* **Armazenamento:** pequeno aumento no espaço em disco em comparação com inteiros sequenciais, impacto considerado irrelevante para a escala do projeto.
* **Gestão de Segredo:** o `JWT_SECRET` precisa ser compartilhado e mantido de forma consistente entre os serviços que validam tokens.
* **Revogação Limitada:** como o modelo é stateless, a invalidação imediata de tokens exige mecanismos adicionais no futuro.
