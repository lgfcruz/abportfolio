# Auditoria de deploy — `abportfolio` / `arthurbrabo-portfolio.netlify.app`

**Data:** 17 de agosto de 2026
**Âmbito:** repositório `github.com/lgfcruz/abportfolio` (branch `main`) e site publicado
**Limitação:** não foi possível autenticar na conta Netlify nesta sessão. A secção 3 é um guião para o senhor executar no painel.

---

## Veredicto em uma linha

**A automação "funciona" no sentido em que o site está online — mas provavelmente já não é reconstruível, e a configuração de build não existe em código nenhum.**

---

## 1. Factos verificados

### No repositório

| Item | Estado |
|---|---|
| Último commit | `4a2b0db add storyboard grupo` — **13 de janeiro de 2023** (14 commits no total) |
| Stack | Quasar 2 + Vue 3 + `@quasar/app-webpack` ^3.0.0 (webpack; o atual é `@quasar/app-vite`) |
| Script `build` no `package.json` | ❌ **Não existe.** Só `lint`, `format` e `test` (este é `echo "No test specified" && exit 0`) |
| `@quasar/cli` nas dependências | ❌ **Não existe.** O README manda correr `quasar build`, comando que não está instalável a partir do repositório |
| `netlify.toml` | ❌ Não existe |
| `_redirects` / `_headers` | ❌ Não existem |
| `.github/` (GitHub Actions) | ❌ Não existe |
| `.nvmrc` / `.node-version` | ❌ Não existem |
| `engines` | `node >= 12.22.1`, `npm >= 6.13.4` — **Node 12 já não existe nos runtimes do Netlify** |
| Lockfile | `yarn.lock` (296 KB), **modificado e não commitado no working tree**. Não existe `package-lock.json` |
| `build.vueRouterMode` | `'hash'` — todas as rotas são `/#/...`, nunca indexáveis |
| SSR | Configurado (`ssr.prodPort: 3000`, middlewares `compression` e `render`, diretório `src-ssr/`) mas o site publicado é SPA. **Código morto enganador** |
| `public/` | 7,9 MB de JPG/PNG/PDF não otimizados versionados, incluindo um PDF de **3,0 MB**. Nomes são hashes SHA-1, ilegíveis |
| `.quasar/` | Presente no working tree apesar de estar no `.gitignore`; alguns ficheiros parecem ter sido commitados no passado |
| Dependabot / Renovate / CODEOWNERS / branch protection | ❌ Nenhum |

### No site publicado

`https://arthurbrabo-portfolio.netlify.app` responde **200** e serve o shell de uma SPA:

```html
<title>Arthur Brabo Portfolio</title>
<meta name="description" content="My portfolio">
<div id="q-app"></div>   <!-- vazio -->
```

Confirma-se que **um build de SPA (não SSR) foi publicado com sucesso em algum momento**. Zero conteúdo no HTML servido, zero Open Graph, zero canonical, sem `robots.txt`, sem `sitemap.xml`. O `<meta name="viewport">` contém `user-scalable=no, maximum-scale=1`, que é uma falha de acessibilidade (WCAG 1.4.4) e penaliza no Lighthouse.

---

## 2. Como é que este site está publicado? Hipóteses ordenadas

Sem `netlify.toml` e sem script `build`, a configuração vive **fora do repositório**.

| # | Hipótese | Prob. | Como confirmar | Como excluir |
|---|---|---|---|---|
| 1 | **Comando de build definido manualmente na UI** — alguém escreveu `quasar build` ou `npx quasar build` e publish `dist/spa` em *Build & deploy → Build settings* | ~60% | Campo *Build command* preenchido; logs mostram esse comando | Campo vazio |
| 2 | **Deploy manual** (arrastar pasta) ou `netlify deploy --prod` por CLI | ~25% | Na lista de deploys, o último aparece como *Manual deploy* / *CLI* em vez de referir commit e branch. Sinal forte: data do último deploy ≠ 13/01/2023 | Deploy referencia um commit de `main` |
| 3 | **Deteção automática de framework** pelo Netlify | ~10% | Logs com linha "Detected Quasar" e comando `npx quasar build` | Logs mostram `npm run build` (que falharia por não existir) |
| 4 | **Build antigo que já não reproduz** — sobrepõe-se a 1 e 3 | alta | Clicar em *Retry deploy with clear cache*. Se falhar, o site está publicado mas é um artefacto órfão | Build limpo passa |

**Teste decisivo, sem conhecimentos de DevOps:** comparar a data do último deploy publicado com 13 de janeiro de 2023, e ler o cabeçalho dos logs.

---

## 3. Guião de verificação no painel Netlify

Partir de `https://app.netlify.com/projects/arthurbrabo-portfolio`. Nada nesta secção altera o site — é só leitura. **Faça isto antes de escrever uma linha de Next.js.**

| # | Onde | O que procurar | ✅ Bom | 🚨 Alarme |
|---|---|---|---|---|
| 1 | **Deploys** (lista) | Origem do último deploy (*Manual* / *CLI* / commit), branch e data | Refere um commit de `main` | "Manual deploy", ou data sem commit correspondente |
| 2 | Último deploy **Published** → **Deploy log** | Versões de Node/npm/yarn e o comando executado. **Guarde este log** | Node 18+ | Node 12, 14 ou 16 |
| 3 | *Project configuration → Build & deploy → Continuous deployment → Repository* | Repositório ligado | `github.com/lgfcruz/abportfolio` | "Repository not linked" ou outro repo |
| 4 | Mesma página, *Branches and deploy contexts* | Production branch; Deploy Previews; Branch deploys | `main`; previews em "Any pull request" | Branch errada; previews desligados |
| 5 | *Build settings* | **Base directory, Build command, Publish directory, Functions directory** — copie literalmente | Campos preenchidos e coerentes | Campos vazios (então é deploy manual) |
| 6 | *Dependency management* | Versão de Node selecionada | Versão suportada | Versão fora de suporte |
| 7 | *Build image selection* | Imagem de build | Imagem atual | Ubuntu Focal / Xenial |
| 8 | *Environment variables* | Nomes (não valores) | Nenhuma, ou só `NODE_VERSION` | Chaves de API — verificar se ainda são válidas e se estão *scoped* |
| 9 | *Build plugins* / *Extensions* | Plugins instalados | Nenhum instalado pela UI — o adaptador Next.js é declarado no `netlify.toml` (ver secção 5) | Plugins de runtime antigo, ou um `@netlify/plugin-nextjs` instalado pela UI a duplicar o do `netlify.toml` |
| 10 | *Deploys → Auto publishing* | Estado da publicação automática | Ativo | "Locked to a specific deploy" / *Stopped* — explica um site congelado |
| 11 | *Project configuration → Notifications* | Notificações configuradas | **Deploy failed → email** | Lista vazia |
| 12 | *Domain management* | Domínio primário, `www`, HTTPS | Certificado Let's Encrypt válido, *Force HTTPS* ativo | "Awaiting external DNS"; certificado a expirar |
| 13 | *Forms* | Formulários | Nenhum (o Quasar não usa Netlify Forms) | Submissões acumuladas nunca lidas |
| 14 | *Functions* | Funções ativas | Vazio (é SPA) | Funções antigas de SSR ainda ativas |
| 15 | *Team settings → Billing → Usage* | Largura de banda, minutos de build | <75% do plano | >75% de qualquer limite (o PDF de 3 MB consome banda) |

**O passo 5 é o mais importante de toda a auditoria.** Essa informação existe num único lugar no mundo — o painel — e não está versionada. Copie-a para o repositório antes de mexer em qualquer coisa.

---

## 4. Riscos por severidade

### Crítico

- **Configuração só na UI.** Não versionada, não revisível, não replicável. Perde-se se alguém a apagar ou se o site for recriado. É o risco central desta auditoria.
- **Site não reconstruível.** Sem `build` no `package.json` e sem `@quasar/cli`, um `git clone && npm i && npm run build` falha. O que está em produção é um artefacto órfão.
- **`engines: node >= 12.22.1`.** Node 12 não existe nos runtimes atuais. O Netlify pina o site à versão default da imagem em que foi criado; qualquer mudança de imagem, `.nvmrc` ou `NODE_VERSION` desalinha e o build quebra sem aviso. Pode também provocar `EBADENGINE` com npm.

### Alto

- **Lockfile incoerente.** `yarn.lock` modificado e não commitado — o que está em produção não corresponde a nada reproduzível. O Netlify usa `yarn` apenas porque o ficheiro existe.
- **Sem headers de segurança.** Sem CSP, sem HSTS, sem `X-Content-Type-Options`, sem `Referrer-Policy`.
- **`.quasar/` no working tree** e possivelmente no histórico: artefactos gerados versionados.

### Médio

- **7,9 MB de binários em Git** com nomes SHA-1 ilegíveis: clones lentos e nenhuma forma de saber o que é cada ficheiro.
- **Sem política de cache explícita** (herda os defaults do Netlify — aceitáveis, mas não intencionais).
- **`vueRouterMode: 'hash'`**: URLs com `#`, sem indexação e sem partilha decente.
- Sem Dependabot/Renovate, sem branch protection, sem CODEOWNERS. SSR configurado mas não usado.

---

## 5. `netlify.toml` alvo (novo projeto Next.js 16)

```toml
[build]
  # "validate" = typecheck + verificação do frontmatter dos projetos.
  # Falha o deploy antes de gastar o build completo.
  command = "npm run validate && npm run build"
  publish = ".next"   # OBRIGATÓRIO — ver a nota abaixo

[build.environment]
  NODE_VERSION = "22"            # duplicar em .nvmrc para quem clona o repo localmente
  # NOTA: não é preciso NPM_FLAGS="--include=dev". A Netlify não define NODE_ENV,
  # logo as devDependencies (typescript, tailwind) instalam-se por omissão.
  # Só seria necessário se algo definisse NODE_ENV=production.

[context.production.environment]
  NEXT_PUBLIC_SITE_URL = "https://arthurbrabo.com"

[context.deploy-preview.environment]
  NEXT_PUBLIC_NOINDEX = "true"   # previews nunca indexados

[context.branch-deploy.environment]
  NEXT_PUBLIC_NOINDEX = "true"

# --- Headers. Nota: headers e redirects são GLOBAIS, não aceitam contexto. ---

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    # FASE 1: Report-Only durante ~1 mês. Depois renomear para Content-Security-Policy.
    Content-Security-Policy-Report-Only = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self' https://plausible.io https://*.vimeo.com https://*.youtube.com; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; upgrade-insecure-requests"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/docs/*"                # CV em PDF e afins
  [headers.values]
    Cache-Control = "public, max-age=604800, must-revalidate"

# --- Redirect do subdomínio antigo. Ativar SÓ depois de o domínio próprio estar a servir. ---

[[redirects]]
  from = "https://arthurbrabo-portfolio.netlify.app/*"
  to = "https://arthurbrabo.com/:splat"
  status = 301
  force = true
```

### Explicação da CSP

`default-src 'self'` fecha tudo por omissão. `frame-src` autoriza os iframes de YouTube (usar sempre `youtube-nocookie.com`) e Vimeo (`player.vimeo.com`) — que só são inseridos depois de um clique. `connect-src` cobre a telemetria e os manifests dos players, mais o Plausible; `script-src` tem de incluir `plausible.io` explicitamente, senão o script de analytics não carrega.

**`img-src` não autoriza `i.ytimg.com` nem `i.vimeocdn.com` — de propósito.** Os posters de vídeo são auto-hospedados (ver `03_ESPECIFICACAO_TECNICA.md`, secção 8), o que cumpre a meta de zero origens terceiras no load inicial e evita que o `maxresdefault` do YouTube falhe em alguns vídeos. **O Netlify Image CDN é same-origin** (`/.netlify/images`), pelo que `img-src 'self'` basta — `blob:` e `data:` cobrem os placeholders do `next/image`.

`frame-ancestors 'none'` substitui o antigo `X-Frame-Options`. `'unsafe-inline'` em `script-src` é o preço de não usar nonces; se quiser endurecer, gerar nonce no proxy.

**Por que Report-Only primeiro:** uma CSP aplicada num site que embebe Vimeo, YouTube e um script de analytics custa uma tarde de depuração por cada integração nova. Em `Report-Only` o senhor vê as violações na consola do browser sem quebrar nada, e promove a aplicada quando estiver estável.

### ⚠️ O `publish` TEM de estar no `netlify.toml` — erro confirmado em produção

A primeira versão deste documento dizia *"SEM publish: o adaptador OpenNext define o output"*. **Está errado, e custou um deploy falhado.**

O que aconteceu no primeiro deploy da reescrita: o build correu até ao fim, gerou as 32 páginas, e depois falhou com

```
Deploy did not succeed: Deploy directory 'dist/spa' does not exist
```

`dist/spa` era o publish directory do **Quasar**, gravado na UI quando o site foi criado em 2023. Como o `netlify.toml` não declarava `publish`, não havia nada a sobrepor esse valor — e a UI ganhou.

**A regra real:** o `netlify.toml` só sobrepõe o que declara. Um campo omitido não é "deixado ao adaptador", é deixado ao que estiver na UI. Num site criado para outro framework, isso é uma mina.

O valor correto é **`.next`**. É o que a deteção automática de framework da Netlify sugere para Next.js (`next build` + `.next`), e está documentado tanto nos docs da Netlify como do OpenNext.

**Não usar `out`.** Esse é o output de `output: 'export'`, que este projeto não usa deliberadamente — o export estático quebraria o `proxy.ts` de negociação de idioma e a otimização do `next/image`.

Com o `publish` no ficheiro, o campo da UI deixa de ser relevante. Limpá-lo é opcional e não faz mal.

### ⚠️ O adaptador Next.js também tem de estar declarado — segundo erro confirmado em produção

Depois de corrigir o `publish`, o deploy passou a dizer "published" e o site devolvia **404 em todas as rotas**.

O *Deploy file browser* mostrou a causa: o que estava publicado era o conteúdo **cru** de `.next` como ficheiros estáticos — `build/`, `cache/`, `server/`, `types/`, `trace`, `required-server-files.json`. Vinte e três entradas, 542 ficheiros, 61,7 MB, e nem um único HTML. Nenhuma função, nenhuma edge function.

Ou seja: o `next build` corria, e depois ninguém transformava o resultado em infraestrutura. **O adaptador Next.js não estava a correr.**

Não era o `netlify.toml` — confirmei que o template oficial (`netlify-templates/next-platform-starter`) declara exatamente `publish = ".next"` e `command`, e nada mais. E o `next` está em `dependencies`, como a deteção exige.

A causa é a **deteção automática de framework não instalar o adaptador neste site**, criado em 2023 para o Quasar. Correção:

```bash
npm install @netlify/plugin-nextjs
```

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Fica em `dependencies` e não em `devDependencies` de propósito: se alguém definir `NODE_ENV=production`, as devDependencies não são instaladas e o site voltaria ao 404.

**Contrapartida:** fixar o adaptador faz perder as suas atualizações automáticas, contra a recomendação da Netlify. Mas aqui não havia atualizações a perder — o adaptador não corria. A reavaliar a cada major do Next.js.

> **Nota de segurança:** enquanto o `.next` cru esteve publicado, ficaram publicamente acessíveis `/server` (15 MB de bundles do servidor), `/cache` (48 MB) e os manifestos de rotas, no URL do branch deploy. Produção não foi afetada. Vale apagar esse deploy no painel depois de o novo passar.

### O que NÃO pôr no `netlify.toml`

`[functions] directory`, redirect SPA `/* → /index.html`, `Cache-Control` para `/_next/*`, e configuração de ISR/revalidação — o adaptador trata disso. Hosts remotos de imagem definem-se em `next.config.ts` (`images.remotePatterns`), não no `netlify.toml`.

E **nunca** o redirect `/* → /index.html` com status 200 que aparece nos fóruns: é conselho para SPAs e neste site quebraria o proxy de idioma, o SSR e o 404 real.

---

## 6. Migração sem quebrar o site

1. **Congelar o estado atual.** Commitar ou reverter o `yarn.lock`. Criar a tag `pre-nextjs` no commit atual — é o âncora de rollback.
2. **Copiar a configuração da UI para o repositório** (passo 5 do guião), num `netlify.toml` que reproduza o build Quasar. Se não for reproduzível, documentá-lo em `DEPLOY.md`: "produção é um artefacto órfão de janeiro de 2023".
3. **Branch `rewrite/nextjs`.** Cada push gera um branch deploy em `https://rewrite-nextjs--arthurbrabo-portfolio.netlify.app`; o PR para `main` gera um deploy preview. **Produção fica intacta durante semanas.**
4. **Validar o preview:** as duas línguas; negociação de idioma na raiz; `next/image` a devolver `/.netlify/images?...` em AVIF/WebP; embeds a carregar sem erros de CSP na consola; PDF a abrir; Lighthouse nas três páginas principais; 404 a devolver status 404; headers via `curl -I`.
5. **Apagar os ficheiros antigos** no mesmo PR: `src/`, `src-ssr/`, `quasar.config.js`, `.quasar/`, `babel.config.js`, `.postcssrc.js`. Acrescentar `.next` ao `.gitignore`. Manter `public/` até renomear e reotimizar as imagens.
6. **Histórico Git: não usar `git-filter-repo`.** 7,9 MB é irrelevante, o repositório é de um autor, e reescrever o histórico invalida SHAs, forks e a ligação de deploys antigos por commit. Basta parar de acrescentar binários; se algum dia houver ficheiros grandes novos, Git LFS.
7. **Lockfile: migrar para npm.** Apagar `yarn.lock`, gerar `package-lock.json` com Node 22, commitar, declarar `"packageManager": "npm@10"`. É o default do Netlify, zero configuração, e o ecossistema Next.js assume npm. pnpm exigiria `PNPM_FLAGS=--shamefully-hoist` com ganho nulo aqui.
8. **Promoção:** merge do PR em `main` → deploy de produção. Testar nos cinco minutos seguintes.
9. **Rollback:** *Deploys* → escolher o último deploy Quasar → **Publish deploy**. Instantâneo, sem passar pelo Git. Só depois investigar. Se o problema for de código, `git revert` do merge.

---

## 7. Domínio, DNS e HTTPS

1. Registar o domínio (`arthurbrabo.com` ou equivalente) **no nome e email do Arthur**. Em *Domain management → Add domain → Add a domain you already own* → verificar → adicionar. O Netlify acrescenta automaticamente o apex **e** o `www`.
2. **Netlify DNS vs. DNS externo:** recomendado **Netlify DNS** (apontar os 4 nameservers no registrar). O apex é resolvido por ALIAS interno com routing direto no CDN, o certificado é automático, e há um único painel. Com DNS externo, o apex fica preso ao IP do load balancer e perde routing direto — razão pela qual o Netlify recomenda usar um subdomínio como primário nesse cenário.
3. **HTTPS:** *Domain management → HTTPS* → *Verify DNS configuration* → *Provision certificate* (Let's Encrypt, gratuito, auto-renovado). Ativar **Force HTTPS**.
4. **Apex vs. www:** recomendado **apex como primário** (`arthurbrabo.com`), com `www` a redirecionar 301 para o apex. Mais curto e memorável, e com Netlify DNS a penalização técnica do apex desaparece. O Netlify cria este redirect sozinho quando se define o domínio primário — **não escrever regra manual**.
5. **`.netlify.app` → domínio novo:** o bloco `[[redirects]]` da secção 5, versionado no repositório. Manter esse redirect ativo indefinidamente (custo zero) — protege links já partilhados em CVs e emails.

> **Antes de migrar:** adicionar a propriedade no **Google Search Console** e exportar Performance → Páginas/Consultas dos últimos 16 meses. Como o site é hash-mode, o Google conhece no máximo uma URL (`/`) — mas ficheiros diretos (`/9535b2bf...pdf`, `/arthur_photo.jpg`) **são** URLs reais e podem estar indexados. Redirecionar cada um que apareça.

---

## 8. Observabilidade e higiene contínua

- **Notificação de deploy falhado** (*Project configuration → Notifications → Add notification → Deploy failed → email*). É o item de maior retorno de todo o relatório: 5 minutos, elimina anos de falhas silenciosas. Deixar *Deploy succeeded* desligado (ruído).
- **Uptime gratuito:** UptimeRobot ou Better Stack, HTTP a cada 5 minutos, alerta por email. Bónus: monitorizar a expiração do certificado e do domínio.
- **Alertas de utilização:** o Netlify envia email aos 75% do plano gratuito — confirmar que o email da equipa está correto.
- **Ritual de manutenção realista — duas vezes por ano, 45 minutos:** correr `npx next build` localmente; atualizar dependências (`npx npm-check-updates -u` e testar); verificar o site nas duas línguas; confirmar validade de certificado e domínio; ler a página de *Usage*; verificar se o showreel ainda é o atual.

### Documentar no repositório (`DEPLOY.md`)

Para que o projeto seja retomável dentro de dois anos, por si ou pelo Arthur:

- Comandos: `dev`, `build`, `validate` — e o que cada um faz
- Versão de Node e porque é essa
- **Onde vive a configuração:** `netlify.toml` é a fonte de verdade; a UI só para segredos
- Nome do site no Netlify e URL do painel
- Branch de produção
- **Como fazer rollback** (Deploys → Publish deploy)
- Lista de variáveis de ambiente e o que cada uma faz
- Registos DNS e onde está registado o domínio
- Procedimento para acrescentar um projeto novo (deve caber em 5 linhas)

---

## 9. Segredos

- **Onde:** *Project configuration → Environment variables* na UI do Netlify, com **scope** restrito. Uma chave da Google Drive API só precisa de *Functions*, nunca de *Builds*. Nunca no `netlify.toml` nem num `.env` commitado. `.env.local` no `.gitignore`; `.env.example` só com nomes.
- **Regra do prefixo:** em Next.js, `NEXT_PUBLIC_` é o único prefixo que expõe o valor ao browser — é inlinado no bundle em build time e fica público para sempre. **Se o nome tem `NEXT_PUBLIC_`, trate-o como se estivesse num tweet.**
- **Não vazar:** nunca ler `process.env.SEGREDO` num componente `'use client'`, nem passá-lo como prop de Server para Client Component. Chamar APIs externas apenas num Route Handler ou função, devolvendo ao cliente só os dados já filtrados.
- O Netlify faz **secret scanning** dos artefactos de build e falha o deploy se detetar um valor de variável no output — comportamento desejável. Em caso de falso positivo, usar `SECRETS_SCAN_OMIT_KEYS`; nunca desativar o scanning por inteiro.

---

## 10. Top 10 ações priorizadas

| # | Ação | Esforço | Risco eliminado |
|---|---|---|---|
| 1 | Ativar notificação de **Deploy failed** por email | 5 min | Falhas silenciosas indefinidas |
| 2 | Ler e **copiar para o repo** a configuração de build da UI (passo 5) | 15 min | Perda irrecuperável da config; ponto cego total |
| 3 | Commitar/reverter o `yarn.lock`; criar tag `pre-nextjs` | 10 min | Estado indeterminado; perda do âncora de rollback |
| 4 | Confirmar que *Auto publishing* está ativo e a branch é `main` | 10 min | Deploys novos nunca chegarem a produção |
| 5 | Registar o domínio no nome do Arthur | 20 min | Dependência de subdomínio de terceiros; contas na pessoa errada |
| 6 | `netlify.toml` + `.nvmrc` (Node 22) no branch de reescrita | 30 min | Config não versionada; quebra por mudança de Node |
| 7 | Migrar para `package-lock.json` + scripts `build` e `validate` | 30 min | Builds não reproduzíveis |
| 8 | Headers de segurança + CSP em `Report-Only`, validados no preview | 1 h | XSS, clickjacking, MIME sniffing, downgrade |
| 9 | `DEPLOY.md` com o procedimento de rollback e de conteúdo | 45 min | Projeto irretomável dentro de dois anos |
| 10 | Netlify DNS + HTTPS + redirect 301 do `.netlify.app` | 1 h (+48 h propagação) | Links partidos na migração |

**As ações 1 a 4 são leitura e confirmação — não alteram nada, e devem ser feitas antes de escrever uma linha de Next.js.** Só depois de 2 e 3 é que a reescrita tem rede de segurança.

---

## Fontes

- [File-based configuration (netlify.toml) — Netlify Docs](https://docs.netlify.com/build/configure-builds/file-based-configuration/)
- [Next.js on Netlify (adaptador OpenNext) — Netlify Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Manage build dependencies — Netlify Docs](https://docs.netlify.com/build/configure-builds/manage-dependencies/)
- [Netlify Image CDN — Netlify Docs](https://docs.netlify.com/build/image-cdn/overview/)
- [Build environment variables — Netlify Docs](https://docs.netlify.com/build/configure-builds/environment-variables/)
- [Secrets Controller — Netlify Docs](https://docs.netlify.com/build/environment-variables/secrets-controller/)
- [Secret scanning — Netlify Docs](https://docs.netlify.com/manage/security/secret-scanning/)
- [Get started with domains — Netlify Docs](https://docs.netlify.com/manage/domains/get-started-with-domains/)
- [Bring a domain to Netlify DNS — Netlify Docs](https://docs.netlify.com/manage/domains/configure-domains/bring-a-domain-to-netlify/)
- [Configure external DNS for a custom domain — Netlify Docs](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)
- [OpenNext adapter for Netlify](https://opennext.js.org/netlify)
