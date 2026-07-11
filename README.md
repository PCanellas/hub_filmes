# 🎬 CineRate — Busca e Avaliação de Filmes

Teste para vaga de Desenvolvedor Web — Pixel Breeders.

Interface de busca de filmes usando a API pública do [TMDB](https://developer.themoviedb.org/docs/getting-started), com sistema de avaliação por usuário (nota de 1 a 5).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript (Vite) + Tailwind CSS |
| Backend | Python (FastAPI) + SQLAlchemy |
| Banco de dados | PostgreSQL 16 |
| Infraestrutura | Docker + Docker Compose (Nginx servindo o frontend) |

## Como rodar

**Pré-requisitos:** Docker e uma chave da API do TMDB ([criar aqui](https://www.themoviedb.org/settings/api)).

1. Clone o repositório e entre na pasta:

   ```bash
   git clone <url-do-repositorio>
   cd <pasta-do-projeto>
   ```

2. Crie o arquivo `.env` a partir do exemplo e preencha sua chave do TMDB:

   ```bash
   cp .env.example .env
   # edite o .env e coloque sua chave em TMDB_API_KEY
   # (aceita tanto a "API Key" v3 quanto o "Read Access Token" v4)
   ```

3. Suba tudo com **um único comando**:

   ```bash
   docker compose up --build
   ```

4. Acesse:
   - **Aplicação:** http://localhost:3000
   - **Documentação da API (Swagger):** http://localhost:8000/docs

## Features implementadas

Todas as features obrigatórias e todos os bônus foram implementados:

### Obrigatórias
- ✅ Barra de pesquisa via API do TMDB (com debounce de 400ms)
- ✅ Listagem de resultados com pôster e título
- ✅ Estados de loading (primeira página, "carregando mais", detalhes) e tratamento de erros com opção de tentar novamente
- ✅ Modal do filme com sinopse, data de lançamento e elenco
- ✅ Avaliação com nota de 1 a 5 — criar, editar e remover
- ✅ Página "Filmes Avaliados" com título, pôster e nota do usuário
- ✅ Clicar em um filme (em qualquer página) abre o modal de detalhes

### Bônus
- ✅ **Scroll infinito** — via `IntersectionObserver`, aproveitando a paginação nativa do TMDB
- ✅ **Filtro por gênero e ano** — na listagem de populares (a API de busca do TMDB não suporta filtros, por isso eles aparecem apenas quando não há texto na busca)
- ✅ **Autenticação** — registro e login com JWT; cada usuário tem suas próprias avaliações
- ✅ **Cache** — respostas do TMDB são cacheadas em memória no backend (TTL de 10 min), evitando chamadas repetidas à API externa

## Arquitetura e decisões técnicas

```
Navegador ──► Nginx (:3000) ──► arquivos estáticos do React
                   │
                   └── /api/* ──► FastAPI (:8000) ──► TMDB (com cache TTL)
                                       │
                                       └──► PostgreSQL (usuários e avaliações)
```

- **O frontend nunca fala direto com o TMDB.** Todas as chamadas passam pelo backend, que atua como proxy. Isso protege a chave da API (nunca chega ao navegador) e centraliza o cache.
- **FastAPI**: framework que já utilizo, com validação automática via Pydantic e documentação Swagger gerada de graça.
- **Banco de dados**: a avaliação tem `UNIQUE (user_id, movie_id)` (uma nota por filme por usuário — editar em vez de duplicar) e `CHECK (score BETWEEN 1 AND 5)`, garantindo as regras de negócio no próprio banco, não só na aplicação. Título e pôster do filme são desnormalizados na tabela de avaliações para a página "Filmes Avaliados" não precisar de N chamadas ao TMDB.
- **Gerenciamento de estado no React**: feito apenas com `useState`/`useEffect` e Context API (`AuthContext` para sessão, `RatingsContext` para avaliações compartilhadas entre Home, modal e página de avaliados) — sem bibliotecas de estado, abordagem que costumo usar no trabalho e que cobre bem o escopo do projeto.
- **Tabelas criadas na inicialização** (`create_all` com retry aguardando o Postgres ficar pronto). Em um projeto real usaria migrations (Alembic); para o escopo do teste, a criação automática simplifica o "um único comando".
- **Senhas** com hash **Argon2id** (vencedor da Password Hashing Competition e recomendação atual da OWASP — memory-hard, resistente a ataques com GPU); tokens JWT com expiração de 24h.

## Estrutura do projeto

```
├── docker-compose.yml      # Postgres + backend + frontend
├── .env.example            # modelo de configuração
├── backend/
│   └── app/
│       ├── main.py         # criação do app, CORS, startup
│       ├── core/           # config, conexão com banco, segurança (JWT/Argon2)
│       ├── models/         # SQLAlchemy: User, Rating
│       ├── schemas/        # Pydantic: contratos de entrada/saída
│       ├── routers/        # endpoints: auth, movies, ratings
│       └── services/       # cliente TMDB com cache
└── frontend/
    └── src/
        ├── api/            # cliente HTTP tipado da nossa API
        ├── components/     # SearchBar, MovieCard, MovieModal, StarRating…
        ├── contexts/       # AuthContext, RatingsContext
        ├── hooks/          # useDebounce
        └── pages/          # Home, Filmes Avaliados, Login
```

## Uso de IA

Desenvolvi este projeto em par com o **Claude Code** (Anthropic), conforme permitido nas instruções do teste. O fluxo de trabalho: a cada etapa, eu definia a decisão técnica nos prompts e a IA acelerava a implementação, que eu revisava e testava antes de seguir.

As decisões que defini nos prompts:

- **FastAPI** como framework Python, no lugar do Django/Flask sugeridos no enunciado — é o que uso no dia a dia de trabalho;
- **Argon2id** para hash de senhas (também por já utilizar no trabalho) e **JWT** para os tokens de autenticação;
- **Tailwind CSS** para a estilização;
- **PostgreSQL** como banco de dados;
- **Modal** para os detalhes do filme, em vez de página separada;
- Gerenciamento de estado com **`useState`/`useEffect` e Context API puros**, sem bibliotecas de estado — abordagem que costumo usar no trabalho;
- Implementação de **todos os quatro bônus** (scroll infinito, filtros, autenticação e cache).

A IA também auxiliou na execução dos testes de ponta a ponta da API. Compreendo e sei explicar todas as decisões técnicas do projeto — elas estão documentadas na seção acima justamente por isso.
