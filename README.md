# EduBlog — Front-end

Interface web do EduBlog, uma plataforma de blogging educacional que permite a professores publicar conteúdo por disciplina e a alunos consultá-lo. Este repositório contém apenas o **front-end**; o back-end (API REST) está em um repositório separado.

Projeto desenvolvido para o **Tech Challenge**.

## Links do projeto

- Repositório do front-end: [EduBlog](https://github.com/Roch-Daniel/EduBlog)
- Repositório do back-end: [blog-api](https://github.com/Roch-Daniel/blog-api)
- Aplicação em produção: [EduBlog - Aplicação Online](https://edublog-lp66.onrender.com)
- API em produção: [API - EduBlog](https://blog-api-dnfx.onrender.com)
- Documentação Swagger da API: [API - EduBlog](https://blog-api-dnfx.onrender.com/docs)
- Apresentação em vídeo: [PREENCHER]

---

## Sumário

- [Stack e principais decisões técnicas](#stack-e-principais-decisões-técnicas)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Configuração do ambiente Docker](#rodando-com-Docker)
- [Rodando o projeto](#rodando-o-projeto)
- [Rodando com Docker](#rodando-com-docker)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura de autenticação e autorização](#arquitetura-de-autenticação-e-autorização)
- [Busca, filtros e catalogação](#busca-filtros-e-catalogação)
- [Integração com a API](#integração-com-a-api)
- [Decisões de segurança](#decisões-de-segurança)
- [Scripts disponíveis](#scripts-disponíveis)
- [Problemas conhecidos / próximos passos](#problemas-conhecidos--próximos-passos)

---

## Stack e principais decisões técnicas

| Tecnologia                | Uso                           | Por quê                                                                                                                                                              |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19 + TypeScript** | Base da aplicação             | Tipagem estática reduz bugs de integração com a API, essencial em projeto de equipe                                                                                  |
| **Vite**                  | Build tool / dev server       | Build rápido, HMR, configuração mínima                                                                                                                               |
| **Tailwind CSS v4**       | Estilização                   | Substitui Styled Components (citado como exemplo no enunciado, que permite "ou outro método de estilização"); produtividade e responsividade via classes utilitárias |
| **React Router DOM**      | Roteamento                    | Rotas aninhadas (`Outlet`) para compor Layout, guardas de autenticação e autorização por papel                                                                       |
| **Context API**           | Estado global de autenticação | Suficiente para o escopo do projeto; Redux seria over-engineering para um CRUD de blog                                                                               |
| **Axios**                 | Cliente HTTP                  | Ver [Decisões de segurança](#decisões-de-segurança)                                                                                                                  |
| **jwt-decode**            | Leitura do payload do JWT     | Permite checar a expiração do token no front-end sem depender de uma chamada à API                                                                                   |

### Sobre o controle de acesso

Diferente do enunciado original (que previa listagem pública de posts), o time optou por **exigir login para acesso a qualquer página**, incluindo a listagem. Após autenticado, o papel do usuário (`PROFESSOR` ou `ALUNO`) é retornado diretamente pela API na resposta de login e convertido internamente pelo front-end (`professor`/`aluno`) para uso nas telas e nas guardas de rota.

> ⚠️ **Importante:** a checagem de papel no front-end é apenas uma camada de **experiência de usuário** (esconder botões, bloquear rotas). A autorização real e vinculante ocorre no back-end, que valida o token JWT e o papel do usuário a cada requisição de escrita — o front-end nunca deve ser a única barreira de segurança.

---

## Pré-requisitos

- **Node.js** `20.19+` ou `22.12+` (recomendado: Node 24 LTS)
- **npm** (vem com o Node)
- **Docker** e **Docker Compose** (opcional, para rodar containerizado)

> Se você usa múltiplas versões de Node, recomendamos o [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows) ou [nvm](https://github.com/nvm-sh/nvm) (Mac/Linux).

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=https://blog-api-dnfx.onrender.com
```

Para rodar contra o back-end localmente em vez da API em produção:

```env
VITE_API_URL=http://localhost:3000
```

> Todas as variáveis consumidas pelo Vite precisam começar com o prefixo `VITE_`. Elas são embutidas no bundle final durante o build — nunca coloque segredos aqui (chaves privadas, `JWT_SECRET`, etc.), pois ficam visíveis no código-fonte enviado ao navegador.

## Rodando com Docker

O projeto possui dois modos de execução através do Docker Compose:

- **Desenvolvimento (`frontend-dev`)**: executa o Vite com hot-reload, indicado para desenvolvimento local.
- **Produção (`frontend-prod`)**: gera o build otimizado da aplicação e o serve através do Nginx.

### Desenvolvimento

Para iniciar somente o ambiente de desenvolvimento:

```bash
docker compose up --build -d frontend-dev
```

Ou

```bash
docker compose --profile dev up --build -d
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

O serviço utiliza volume do projeto e hot-reload, permitindo que alterações no código sejam refletidas no container sem a necessidade de recriá-lo a cada alteração.

Para visualizar os logs:

```bash
docker compose logs -f frontend-dev
```

Para parar o serviço:

```bash
docker compose stop frontend-dev
```

### Produção

Para gerar a imagem de produção e iniciar o container:

```bash
docker compose up --build -d frontend-prod
```

A aplicação ficará disponível em:

```text
http://localhost:8080
```

Nesse modo, o projeto é compilado pelo Node.js e os arquivos gerados em `dist/` são servidos pelo Nginx.

Para visualizar os logs:

```bash
docker compose logs -f frontend-prod
```

Para parar o serviço:

```bash
docker compose stop frontend-prod
```

### Executando os dois ambientes

Também é possível iniciar os dois serviços simultaneamente:

```bash
docker compose up --build -d
```

Nesse caso:

| Serviço         | URL                     | Uso                                  |
| --------------- | ----------------------- | ------------------------------------ |
| `frontend-dev`  | `http://localhost:5173` | Desenvolvimento com hot-reload       |
| `frontend-prod` | `http://localhost:8080` | Build de produção servido pelo Nginx |

Para verificar os containers em execução:

```bash
docker compose ps
```

Para parar todos os serviços:

```bash
docker compose down
```

> **Observação:** `docker compose up --build -d` inicia todos os serviços definidos no `docker-compose.yml`. Para iniciar apenas um ambiente, informe o nome do serviço (`frontend-dev` ou `frontend-prod`).

### Desenvolvimento

Para iniciar somente o ambiente de desenvolvimento:

````bash
docker compose up --build -d frontend-dev


## Rodando o projeto

```bash
npm install
npm run dev
````

Acesse em `http://localhost:5173`.

## Estrutura de pastas

```text
.
├── public/                 # Recursos estáticos servidos na raiz (favicons, manifest)
├── src/
│   ├── assets/             # Recursos visuais importados pelo código (logos, imagens, ícones)
│   ├── components/
│   │   ├── layout/         # Header, Footer, Layout, UserMenu (estrutura fixa da aplicação)
│   │   ├── filters/        # Painel de filtros da listagem (FilterPanel, FilterCheckboxGroup)
│   │   ├── posts/          # Exibição de posts (PostCard, PostListItem, PostCollection, ViewToggle)
│   │   └── ui/             # Blocos reutilizáveis (LoadingState, ErrorState, EmptyState, Pagination, ToastContainer)
│   ├── context/            # Contextos React (AuthContext, ToastContext)
│   ├── hooks/              # Hooks customizados (useAuth, useToast, useClickOutside, useDebounce, usePostFilters)
│   ├── interfaces/         # Tipos e interfaces TypeScript de domínio
│   ├── pages/              # Páginas atreladas a rotas (Home, Login, Discipline, SearchResults, PostView...)
│   ├── routes/             # Configuração de rotas e guardas (RequireAuth, RequireRole)
│   ├── services/           # Camada de comunicação com a API (authService, postService, catalogService)
│   ├── types/              # Tipos utilitários e auxiliares gerais
│   ├── utils/              # Funções utilitárias puras (datas, slugs, expiração de token, paginação, filtros)
│   ├── App.css             # Estilos específicos do componente App
│   ├── App.tsx             # Componente raiz da aplicação com provedores e rotas
│   ├── index.css           # Diretivas do Tailwind CSS e estilos globais
│   └── main.tsx            # Ponto de entrada do React DOM
├── .dockerignore           # Arquivos ignorados pelo build do Docker
├── .env                    # Variáveis de ambiente locais
├── .gitignore              # Arquivos ignorados pelo Git
├── docker-compose.yml      # Orquestração dos containers (dev e prod)
├── Dockerfile              # Instruções de multi-stage build da imagem
├── eslint.config.js        # Regras de linting do código
├── index.html              # Template HTML base servido pelo Vite
├── nginx.conf              # Configuração do servidor Nginx para o build de produção
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações raiz do compilador TypeScript
├── tsconfig.app.json       # Configurações do TypeScript para o código em src
├── tsconfig.node.json      # Configurações do TypeScript para scripts de build (Vite/Node)
└── vite.config.ts          # Configurações do empacotador e servidor de dev Vite

```

### Convenções adotadas

- **`pages/` vs `components/`**: se o item tem rota própria, é `pages/`; se é reutilizável dentro de páginas, é `components/`.
- **Interfaces prefixadas com `I`** (`IUser`, `IPost`, `IAuthContextType`): convenção comum em bases vindas de C#/Java; time optou por manter para consistência interna.
- **Arquivos de hook/contexto separados** (`AuthContextDefinition.ts`, `AuthContext.tsx`, `useAuth.ts`): necessário para compatibilidade com o Fast Refresh do Vite, que exige que cada arquivo exporte apenas um tipo de coisa (componente, ou hook, ou definição) para preservar o hot-reload sem reload completo da página.
- **`role` em maiúsculo (`PROFESSOR`/`ALUNO`) na API, minúsculo (`professor`/`aluno`) no front-end**: a conversão acontece em um único ponto (`AuthContext.login`), evitando espalhar essa diferença de convenção pelo restante do código.

---

## Arquitetura de autenticação e autorização

O controle de acesso é implementado em duas camadas independentes, usando rotas aninhadas do React Router:

1. **`RequireAuth`** — verifica se existe uma sessão ativa (`isAuthenticated`) e se o token ainda não expirou. Se não, redireciona para `/login`, preservando a rota de origem para retomar a navegação após o login.
2. **`RequireRole`** — aplicado apenas às rotas de escrita (`/posts/new`, `/posts/:id/edit`, `/admin`), verifica se o papel do usuário logado é `PROFESSOR`.

O estado de autenticação é gerenciado via **Context API** (`AuthContext`) e passa por duas verificações de validade:

- **Na inicialização** (lazy initial state do `useState`): o token salvo é decodificado (via `jwt-decode`) e sua data de expiração é comparada com o horário atual. Um token expirado é descartado automaticamente, sem exigir nenhuma chamada à API.
- **Em tempo real**: um interceptor de resposta do Axios (`services/api.ts`) captura qualquer resposta `401 Unauthorized` da API — cenário que ocorre quando o token expira **durante** o uso da aplicação — e força logout + redirecionamento imediato para `/login`.

A sessão é armazenada em **`sessionStorage`** (não `localStorage`), uma decisão deliberada: a autenticação deve persistir durante recarregamentos de página (F5) e navegação entre abas da mesma janela, mas **não deve sobreviver ao fechamento do navegador** — exigindo login novamente na próxima abertura, mesmo que o token ainda estivesse tecnicamente válido no servidor. Essa escolha prioriza segurança sobre conveniência, adequada ao contexto de uma aplicação usada por múltiplos perfis (professores e alunos) em dispositivos potencialmente compartilhados.

---

## Busca, filtros e catalogação

A filtragem é dividida em duas camadas, conforme o que a API suporta:

- **No servidor** (`GET /posts/search`, com parâmetros montados por `buildSearchParams`): disciplina, professor e termo de busca.
- **No cliente** (`utils/filters.ts`, aplicado ao resultado retornado pelo servidor): série e semestre, que a API ainda não aceita como parâmetro.

Cada tela realiza duas chamadas. `GET /posts` fornece apenas as opções exibidas no painel de filtros, enquanto `GET /posts/search` retorna a lista de publicações apresentada ao usuário. As opções do painel não são extraídas do resultado filtrado, pois, nesse caso, selecionar uma disciplina poderia fazer as demais opções desaparecerem e dificultar a alteração dos filtros.

O estado da listagem é armazenado na URL e controlado por um único hook (`usePostFilters`):

```text
/conteudo/matematica?serie=1º+ano%2C3º+ano&semestre=1&author=Ana+Professora
```

- **Persistente**: recarregar a página preserva a seleção, sem exigir contexto global.
- **Tolerante**: parâmetro inválido cai no padrão em vez de quebrar a tela, e valores padrão (`view=grid`, `page=1`) são omitidos para manter a URL legível.

As alterações utilizam `replace` em vez de `push`, evitando que a seleção de vários filtros crie diversas entradas no histórico do navegador.

### Como os filtros combinam

Dentro de um mesmo grupo, os filtros utilizam a relação **OU**, entre grupos diferentes, utilizam a relação **E**. Por exemplo, selecionar "1º ano" e "3º ano" reúne os resultados das duas séries. Ao acrescentar "1º semestre", a listagem passa a exibir apenas as publicações que também atendem a essa condição.

- As opções de série e semestre são extraídas das publicações carregadas, e não de uma lista fixa, pois a API não disponibiliza um catálogo para esses campos.
- As opções são ordenadas numericamente (`1º ano` aparece antes de `10º ano`), e grupos sem opções não são renderizados.
- As opções do filtro de professor também são extraídas das publicações para preencher o `<select>`. Por isso, são exibidos apenas professores que já publicaram conteúdo. A filtragem, porém, é realizada pela API por meio do parâmetro `?author=`.

### Busca

A barra de busca do cabeçalho (`SearchBar`) utiliza um `useDebounce` de 300 ms antes de gerar as sugestões. A comparação considera o título, o resumo e o nome do professor, utilizando `normalizeText`. Assim, digitar `celulas`, por exemplo, permite sugerir "Células" no menu de resultados.

- Essa normalização ocorre apenas localmente, na geração das sugestões. O termo submetido é enviado sem alterações para `GET /posts/search?q=`, que ainda exige acentuação e grafia exatas.
- O menu de sugestões permite navegação pelo teclado com (`↓`/`↑`/`Enter`/`Esc`), além de ser fechado quando o usuário clica fora dele.
- O componente fornece semântica de combobox por meio de atributos como (`role="combobox"`, `aria-activedescendant`).

### Estados de interface

`LoadingState`, `ErrorState` e `EmptyState` cobrem os possíveis estados da listagem: carregamento, falha de rede, disciplina sem conteúdo publicado e filtro sem resultados. Neste último caso, há um atalho para limpar a seleção. Além disso, a paginação corrige automaticamente páginas fora do intervalo, evitando que a lista fique vazia quando um filtro reduz o total de resultados.

---

## Integração com a API

Base URL configurada via `VITE_API_URL`. Principais endpoints consumidos:

| Método | Endpoint               | Autenticação | Uso no front-end                         |
| ------ | ---------------------- | ------------ | ---------------------------------------- |
| POST   | `/auth/login`          | —            | Tela de login                            |
| GET    | `/posts`               | Pública      | Listagem (apenas posts com status ativo) |
| GET    | `/posts/all`           | Professor    | Página administrativa (inclui rascunhos) |
| GET    | `/posts/:id`           | Pública      | Leitura de post individual               |
| POST   | `/posts`               | Pública      | Criação de post                          |
| PUT    | `/posts/:id`           | Professor    | Edição de post                           |
| DELETE | `/posts/:id`           | Professor    | Exclusão de post                         |
| GET    | `/catalog/disciplines` | Pública      | Popula filtros, navegação e formulários  |
| GET    | `/catalog/status`      | Pública      | Popula formulários de criação/edição     |

Todas as respostas seguem o formato `{ data: ... }`; a camada `services/` é responsável por desembrulhar esse envelope antes de entregar os dados aos componentes.

O token JWT retornado no login (validade de 8 horas, definida no back-end) é armazenado em `sessionStorage` e anexado automaticamente ao cabeçalho `Authorization: Bearer <token>` em requisições subsequentes, via interceptor do Axios.

---

## Decisões de segurança

### Axios

Em 31 de março de 2026, o pacote `axios` sofreu um ataque à cadeia de suprimentos (conta de mantenedor comprometida), com versões maliciosas (`1.14.1` e `0.30.4`) publicadas por cerca de 3 horas antes de removidas do registro npm. Não é uma vulnerabilidade no código do axios em si, e as versões afetadas já foram removidas.

Como medida de precaução, o projeto fixa a versão exata do axios no `package.json` (sem `^`), evitando atualizações automáticas não revisadas:

```json
"axios": "1.19.0"
```

### React Router DOM — GHSA-qwww-vcr4-c8h2

O `npm audit` reporta uma vulnerabilidade de CSRF (severidade alta) relacionada às **APIs instáveis de React Server Components (RSC)** do React Router, corrigida apenas na versão major `8.3.0+`. Como este projeto é uma **SPA client-side pura**, sem uso de RSC ou APIs `unstable_`, a vulnerabilidade **não é aplicável** ao contexto de uso atual. Optou-se por não forçar uma migração de major version (`npm audit fix --force` rebaixaria a versão em vez de corrigir de fato) sem uma avaliação deliberada das breaking changes da v8.

### Expiração de sessão

A sessão do usuário expira em duas situações, cobrindo tanto o uso ativo quanto o abandono da aplicação:

- **Token JWT expirado** (8h após o login, validado tanto no back-end quanto no front-end via decodificação local do token e via interceptor de resposta 401).
- **Fechamento do navegador**, já que a sessão é mantida em `sessionStorage`, não em `localStorage`.

---

## Scripts disponíveis

| Comando           | Descrição                                       |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento            |
| `npm run build`   | Gera o build de produção em `dist/`             |
| `npm run preview` | Serve o build de produção localmente para teste |
| `npm run lint`    | Executa o ESLint                                |

---

## Problemas conhecidos / próximos passos

- [ ] Remover bloco de credenciais de teste da tela de login antes da entrega final.
- [ ] Chamadas a `/posts` e `/catalog/disciplines` são feitas de forma independente pelo `Header` e pela `Home`, sem cache compartilhado — avaliar mover para um Context ou adotar uma lib de cache (React Query/SWR) em iteração futura.
- [ ] Filtro de posts publicados compara `status.label` como string (`"Publicado"`); considerar usar um identificador mais estável (`_id` ou um campo booleano dedicado) para reduzir acoplamento com o texto exibido.
- [ ] Páginas de criação, edição e administração de posts (`/posts/new`, `/posts/:id/edit`, `/admin`) ainda não implementadas.
- [ ] Rotas `/perfil` e `/favoritos`, referenciadas no menu do usuário, ainda não possuem páginas implementadas.
- [ ] [PREENCHER conforme o time avançar: comentários, paginação, upload de imagem, etc.]

---

## Relato de desenvolvimento

Algumas alterações no back-end foram necessárias para atender às demandas do front-end. Um exemplo foi a criação do campo `isFeatured` nos posts, utilizado para viabilizar o carrossel de destaques da página inicial. Também identificamos limitações no endpoint de busca (`/posts/search`), como a sensibilidade à acentuação e à grafia exata nos parâmetros `q` e `discipline`, o que exigiu alinhamento com quem mantém a API para entender o comportamento real antes de ajustar o front-end.
