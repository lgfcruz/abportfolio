# Deploy — runbook

Escrito para ser lido dentro de dois anos, por alguém que não se lembra de nada.

## Onde vive o quê

| | |
|---|---|
| Repositório | `github.com/lgfcruz/abportfolio` |
| Branch de produção | `main` |
| Site Netlify | `arthurbrabo-portfolio` |
| Painel | https://app.netlify.com/projects/arthurbrabo-portfolio |
| URL atual | https://arthurbrabo-portfolio.netlify.app |
| Domínio próprio | *(a registar — no nome do Arthur)* |
| **Fonte de verdade da configuração** | **`netlify.toml`, neste repositório.** A UI do Netlify serve apenas para segredos |

## Como funciona

```
git push (main)  →  Netlify  →  npm run validate && npm run build  →  produção
```

O `validate` corre **antes** do build. Se o conteúdo estiver inválido, o deploy falha e **o deploy anterior mantém-se em produção**. Não há como publicar o site partido por causa de um JSON mal escrito.

Todas as 32 páginas são pré-renderizadas no build. Não há base de dados, não há API, não há runtime a manter.

## Node

Fixado em **22**, em dois lugares que têm de concordar: `.nvmrc` e `[build.environment]` no `netlify.toml`. O `engines` do `package.json` diz `>=22`.

Se um dia o build começar a falhar sem nada ter mudado no código, a primeira hipótese é a Netlify ter mudado a imagem de build por omissão.

## Erros já vistos, e a causa

### Aviso de descontinuação do Node 16 nas funções

Se aparecer *"You're using the build time Node.js version 16.x"*, **verificar primeiro a data na mensagem.** A descontinuação referida é de 25 de abril de 2024 — se a data for antiga, o aviso vem de um deploy antigo, do tempo do Quasar, quando não havia `.nvmrc` e a versão vinha apenas da UI.

Este repositório declara Node 22 em três lugares: `.nvmrc`, `NODE_VERSION` no `netlify.toml`, e `engines` no `package.json`. Segundo a [documentação da Netlify](https://docs.netlify.com/build/configure-builds/manage-dependencies/), o `.nvmrc` e o `NODE_VERSION` **sobrepõem** a versão escolhida na UI — ao contrário do `publish`, que só ganha se estiver declarado.

Para confirmar qual a versão realmente usada, o `npm run validate` imprime-a na primeira linha do log de cada deploy:

```
ambiente  Node 22.x.x, npm run validate
```

E falha o build se for inferior a 22, com instruções. Se um deploy novo mesmo indicar 16:

1. *Deploys* → **Retry with clear cache** (a versão de Node é cacheada entre builds)
2. *Environment variables* → procurar um `AWS_LAMBDA_JS_RUNTIME` antigo, que força a versão das funções independentemente do build
3. *Build image selection* → uma imagem antiga não oferece Node 22


### `Deploy directory 'dist/spa' does not exist`

O build passa, o deploy falha. `dist/spa` era o publish directory do Quasar, gravado na UI do Netlify em 2023.

**Causa:** o `netlify.toml` só sobrepõe o que declara. Enquanto não declarava `publish`, o valor obsoleto da UI ganhava. Um campo omitido não é "deixado ao adaptador" — é deixado à UI.

**Corrigido** com `publish = ".next"` no `netlify.toml`. Não remover essa linha, e não a trocar por `out` (esse seria o output de `output: 'export'`, que este projeto não usa).

## Reverter (rollback)

**Instantâneo, sem passar pelo Git:**

1. Netlify → **Deploys**
2. Escolher o último deploy que estava bom
3. **Publish deploy**

Só depois investigar. Se o problema for de código, `git revert` do commit e push.

## A rede de segurança

| Âncora | O que é |
|---|---|
| Tag `pre-nextjs` | O último estado do projeto Quasar (janeiro de 2023). Tudo o que foi apagado na reescrita está recuperável a partir daqui: `git checkout pre-nextjs -- <ficheiro>` |
| Branch `rewrite/nextjs` | A reescrita. Enquanto não for fundida em `main`, produção continua a servir o Quasar antigo |

## Publicar a reescrita

Antes de fundir em `main`, verificar no deploy preview do branch:

- [ ] `/` redireciona (307) para `/pt` com `Accept-Language: pt-PT`, e para `/en` sem cabeçalho
- [ ] `/pt/*` e `/en/*` devolvem 200 e **nunca** redirecionam
- [ ] `/en/nao-existe` devolve **404**, não 200
- [ ] `hreflang` presente nas duas versões, com `x-default` → `/en`
- [ ] O seletor de idioma preserva a rota (de `/pt/work/x` vai para `/en/work/x`)
- [ ] As imagens são servidas via `/_next/image` em AVIF/WebP
- [ ] Nenhum pedido a `youtube.com` ou `vimeo.com` **antes** de clicar no play (DevTools → Network)
- [ ] Nenhum erro de CSP na consola
- [ ] O PDF do CV abre
- [ ] Lighthouse mobile ≥ 90 em `/`, `/work` e `/work/[slug]`
- [ ] O deploy preview tem `noindex` (garantido por `NEXT_PUBLIC_NOINDEX`)

Depois: merge do PR em `main` → deploy de produção. Testar nos cinco minutos seguintes.

## O que fazer ANTES de tudo isto

Ver `docs/01_AUDITORIA_DEPLOY_NETLIFY.md`, secção 3. Em resumo, quatro ações de leitura no painel do Netlify que não alteram nada e que valem mais do que qualquer código:

1. **Ativar a notificação de *Deploy failed* por email.** 5 minutos. Elimina anos de falhas silenciosas
2. Ler e anotar *Build settings* — essa configuração existia num único lugar no mundo antes deste `netlify.toml`
3. Confirmar que *Auto publishing* está ativo e a branch de produção é `main`
4. Confirmar a versão de Node e a imagem de build

## Segredos

Ainda não há nenhum. Se algum dia houver (por exemplo, a Google Drive API através de uma função serverless):

- Vão para *Project configuration → Environment variables* na UI do Netlify, com **scope** restrito a *Functions*
- **Nunca** no `netlify.toml`, nunca num `.env` commitado
- **`NEXT_PUBLIC_` é o único prefixo que expõe o valor ao browser.** É inlinado no bundle em build time e fica público para sempre. Se o nome tem `NEXT_PUBLIC_`, trata-o como se estivesse num tweet
- Nunca ler `process.env.SEGREDO` num componente `'use client'`, nem passá-lo como prop de Server para Client Component
- O Netlify faz *secret scanning* dos artefactos e falha o deploy se detetar um valor de variável no output. Isto é desejável — não desativar

## Content Security Policy

Está em `Content-Security-Policy-**Report-Only**` de propósito. Durante cerca de um mês, as violações aparecem na consola do browser sem quebrar nada. Quando estiver estável, renomear o cabeçalho no `netlify.toml` para `Content-Security-Policy`.

Razão: uma CSP aplicada num site que embebe Vimeo, YouTube e analytics custa uma tarde de depuração por cada integração nova.

## Domínio próprio

Procedimento completo em `docs/01_AUDITORIA_DEPLOY_NETLIFY.md`, secção 7. Resumo:

1. Registar o domínio **no nome e email do Arthur**
2. *Domain management → Add a domain you already own*
3. Apontar os 4 nameservers para o **Netlify DNS** (o apex ganha routing direto no CDN)
4. *HTTPS → Provision certificate* (Let's Encrypt, automático) e ativar **Force HTTPS**
5. Apex como primário; o Netlify cria o redirect de `www` sozinho — não escrever regra manual
6. Só então descomentar o bloco `[[redirects]]` do `netlify.toml`, que manda o `.netlify.app` antigo para o domínio novo. Manter esse redirect ativo para sempre: protege links já enviados em CVs e emails
7. Atualizar `site.url` em `content/site.json`

**Antes de migrar:** adicionar a propriedade no Google Search Console e exportar Performance → Páginas. O site antigo era hash-mode, logo o Google conhece no máximo uma URL — mas ficheiros diretos (`/9535b2bf….pdf`, `/arthur_photo.jpg`) eram URLs reais e podem estar indexados. Redirecionar os que aparecerem.

## Manutenção — o ritual realista

Duas vezes por ano, 45 minutos:

- [ ] `npm install && npm run validate && npm run build` localmente
- [ ] Atualizar dependências (`npx npm-check-updates -u`) e voltar a construir
- [ ] Ver o site nas duas línguas, em telemóvel e em desktop
- [ ] Confirmar a validade do certificado e do registo do domínio
- [ ] Ler *Usage* no Netlify (a Netlify avisa aos 75% do plano gratuito)
- [ ] **Confirmar que o showreel ainda é o atual.** Um reel de há dois anos lê-se como negligência
- [ ] Verificar que os `"placeholder": true` já desapareceram do `content/`

## Notas sobre versões

Duas escolhas que parecem estranhas e não são:

- **TypeScript fixado em 6.x, não 7.** O TypeScript 7.0 já é a versão estável mais recente, mas o `typescript-eslint` ainda não o suporta e o `npm run lint` deixa de correr. Voltar a 7 quando o `typescript-eslint` o suportar.
- **ESLint fixado em 9.x, não 10.** O `eslint-config-next@16` traz um `eslint-plugin-react` incompatível com o ESLint 10 (`contextOrFilename.getFilename is not a function`).

Em ambos os casos, o motivo é ferramenta a jusante, não o compilador. Vale reavaliar a cada major do Next.js.
