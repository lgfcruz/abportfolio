# Guia de conteúdo

**Como editar tudo neste site sem tocar em código.**

Este guia é para o Arthur. Não precisas de saber React, nem TypeScript, nem o que é um componente. Todo o conteúdo do site vive em ficheiros `.json` dentro da pasta `content/`. Editas o JSON, guardas, fazes commit, e o site atualiza-se.

Quando algo estiver mal escrito no JSON, o comando `npm run validate` diz-te exatamente qual é o ficheiro, qual é o campo e o que está errado — em português. E se estiver mal, **o deploy falha e o site anterior continua no ar**, por isso não há risco de publicar o site partido.

---

## Os cinco ficheiros

```
content/
  site.json        Quem és, contactos, redes sociais, CV, educação
  taxonomy.json    Categorias, subcategorias, papéis e software disponíveis
  showreel.json    O showreel: ID do vídeo, duração, lista de planos
  about.json       Bio, competências, ferramentas
  projects/        Um ficheiro .json por projeto
```

Mais dois, para o texto dos botões e rótulos da interface:

```
messages/pt.json   e   messages/en.json
```

---

## Regra de ouro dos campos bilingues

Qualquer campo escrito assim é bilingue:

```json
"summary": {
  "pt": "Texto em português de Portugal.",
  "en": "Text in English."
}
```

**Basta um dos dois estar preenchido.** Se faltar o português, o site mostra o inglês, marca o idioma corretamente para leitores de ecrã, e avisa o visitante com *"Este texto está disponível apenas em inglês."* Isso é intencional: é melhor do que um português desatualizado.

O `validate` avisa-te de tudo o que está só num idioma, sem falhar o build.

**Não se traduz:** títulos de projeto, nomes de pessoas, nomes de software (`Autodesk Maya`, `Dragonframe`).

---

## Acrescentar um projeto novo

### 1. Copia o modelo

```bash
cp content/projects/rascunho-exemplo.json content/projects/o-meu-projeto.json
```

O `slug` tem de ser **igual ao nome do ficheiro** sem o `.json`, só com letras minúsculas, números e hífenes. O `validate` verifica isto.

### 2. Cria a pasta das imagens

```bash
mkdir public/media/o-meu-projeto
```

Põe as imagens lá dentro. Nomes descritivos, nunca `IMG_0472.jpg`:

```
public/media/o-meu-projeto/
  cover.jpg                    1800×1200  (3:2)  — a miniatura na grelha
  hero.jpg                     2560×1440  (16:9) — a imagem grande no topo
  og.jpg                       1200×630          — a imagem que aparece ao partilhar o link
  poster.jpg                   1920×1080  (16:9) — o fotograma antes de se clicar no vídeo
  process-01-concept.jpg       2000 px de largura
  process-02-wireframe.jpg
  gallery-01.jpg               2560×1440
```

### 3. Preenche o JSON

Só quatro campos são obrigatórios para o projeto aparecer: `slug`, `status`, `title` e `cover`. Tudo o resto pode ficar vazio (`null` ou `[]`) e a secção correspondente simplesmente não aparece no site.

### 4. Passa a `published`

```json
"status": "published"
```

Enquanto estiver `"draft"`, o projeto **não aparece no site nem no sitemap**. Serve para ires escrevendo em paz.

### 5. Verifica

```bash
npm run validate
```

Se as dimensões que escreveste não corresponderem às imagens reais, corrige sozinho:

```bash
npm run validate -- --fix
```

### 6. Publica

```bash
git add .
git commit -m "novo projeto: o meu projeto"
git push
```

O Netlify constrói e publica. Se o `validate` falhar, o deploy para e o site atual mantém-se.

---

## Campos de um projeto, explicados

### Identidade

| Campo | O que é |
|---|---|
| `slug` | O endereço: `/pt/work/o-meu-projeto`. Igual ao nome do ficheiro |
| `status` | `"published"` (aparece) ou `"draft"` (não aparece) |
| `featured` | `true` para aparecer na página inicial |
| `order` | Ordem. Números menores aparecem primeiro |
| `surface` | A luz da página. `"dark"` para renders dramáticos, `"mid"` para stop motion, `"light"` para trabalho toon e animação 2D |
| `title` | O nome da peça. **Nunca "Projeto Final 3D"** — dá-lhe um nome próprio |
| `subtitle` | Bilingue. Uma linha a dizer o que é |
| `year` / `date` | O ano, e a data em `AAAA-MM-DD` |
| `durationLabel` | Bilingue: `"6 semanas"` / `"6 weeks"` |

### Contexto e créditos

| Campo | O que é |
|---|---|
| `context` | `"individual"` ou `"group"` |
| `institution` | `"Universidade Lusófona"`, ou `null` se for pessoal |
| `team` | **Obrigatório se `context` for `"group"`.** O `validate` recusa um projeto de grupo sem créditos |

Num projeto de grupo, o `team` fica assim:

```json
"team": {
  "size": 4,
  "label": { "pt": "Equipa de 4", "en": "Team of 4" },
  "myRole": {
    "pt": "O meu papel: look dev dos materiais toon e iluminação",
    "en": "My role: toon material look dev and lighting"
  },
  "credits": [
    { "name": "Arthur Brabo", "role": { "pt": "Look dev, iluminação", "en": "Look dev, lighting" }, "isMe": true },
    { "name": "Nome do colega", "role": { "pt": "Modelação", "en": "Modelling" }, "isMe": false }
  ]
}
```

> **Porque é que isto importa.** Um recrutador desconta trabalho académico ou de grupo que **descobre por si**. Declarado, ele avalia só o craft — e nomear os colegas lê-se como maturidade, não como fraqueza. Escreve sempre verbo + entregável + número: *"Riggei uma criatura quadrúpede: 58 controlos, 6 blendshapes faciais."* Nunca "colaborei em".

### Classificação

`category` tem de ser um dos slugs de `taxonomy.json`. `subcategories` só aceita subcategorias **dessa** categoria. `roles` e `software` também só aceitam slugs da taxonomia — assim os rótulos ficam consistentes e traduzidos automaticamente nos dois idiomas.

Se precisares de um papel ou software novo, acrescenta-o primeiro a `taxonomy.json`.

Categorias disponíveis: `character-animation`, `stop-motion`, `modeling`, `rigging`, `motion-vfx`, `studies`.

> Uma categoria sem nenhum projeto publicado **não aparece** no site. Categorias vazias não existem — foi exatamente isso que afundou a versão anterior do portfólio.

### Imagens

Todas as imagens seguem o mesmo formato:

```json
"cover": {
  "src": "/media/o-meu-projeto/cover.jpg",
  "width": 1800,
  "height": 1200,
  "alt": {
    "pt": "Criatura quadrúpede em pose de emboscada, contraluz azul.",
    "en": "Quadruped creature in an ambush pose, blue backlight."
  }
}
```

**O `alt` não é opcional.** Descreve o que se vê e porque interessa, em menos de 150 caracteres, sem "imagem de" e sem o nome do ficheiro:

| Mal | Bem |
|---|---|
| `alt: "render"` | `alt: "Cabeça de criatura em plano fechado, luz lateral azul, pele escamada."` |
| `alt: "final_v12.png"` | `alt: "Mapa UV em três UDIMs, ilhas separadas por cabeça, torso e membros."` |
| `alt: "uv"` | `alt: "Wireframe do modelo, malha quad com maior densidade nas articulações."` |

### Vídeo

```json
"video": { "provider": "youtube", "id": "ECYD_8EMmnY", "title": { "pt": "…", "en": "…" }, "durationSeconds": 22 },
"poster": { "src": "/media/o-meu-projeto/poster.jpg", "width": 1920, "height": 1080, "alt": { "pt": "…", "en": "…" } }
```

`provider` é `"youtube"` ou `"vimeo"`. O `id` é só o identificador, **não o URL inteiro**:

- YouTube — `https://www.youtube.com/watch?v=`**`ECYD_8EMmnY`**
- Vimeo — `https://vimeo.com/`**`123456789`**

**Se puseres `video`, tens de pôr `poster`.** O site nunca carrega o reprodutor antes de alguém clicar — um embed do YouTube pesa 1,2 MB e traz cookies de terceiros. O `poster` é o fotograma que se vê até ao clique. O `validate` recusa vídeo sem poster.

### Processo (`breakdown`)

É aqui que o projeto deixa de ser uma galeria e passa a contar uma história. Cada etapa aceita imagens **e** vídeos misturados:

```json
"breakdown": [
  {
    "step": 1,
    "label": { "pt": "Modelação e topologia", "en": "Modelling and topology" },
    "note": {
      "pt": "O ombro foi refeito três vezes. A densidade de malha está onde há deformação real.",
      "en": "The shoulder was rebuilt three times. Mesh density is where actual deformation happens."
    },
    "media": [
      { "type": "image", "src": "/media/o-meu-projeto/process-02-wireframe.jpg", "width": 2000, "height": 1125, "alt": { "pt": "…", "en": "…" } },
      { "type": "video", "provider": "youtube", "id": "22LmKyppBlw", "title": { "pt": "…", "en": "…" }, "durationSeconds": 12,
        "poster": { "src": "/media/o-meu-projeto/process-rig.jpg", "width": 1920, "height": 1080, "alt": { "pt": "…", "en": "…" } } }
    ]
  }
]
```

Na `note`, escreve **a decisão que tomaste**, não o que qualquer pessoa faria. "Modelei em Maya" não diz nada. "Reduzi a três articulações por membro e ancorei o peso num único ponto de contacto por passo" diz tudo.

### Especificações (`specs`)

Números concretos. É o que dá credibilidade técnica sem parecer vaidade:

```json
"specs": [
  { "label": { "pt": "Contagem de triângulos", "en": "Triangle count" }, "value": "42k" },
  { "label": { "pt": "Rig", "en": "Rig" }, "value": { "pt": "58 controlos", "en": "58 controls" } }
]
```

O `value` pode ser uma string simples (números, nomes de software) ou bilingue.

### Downloads e links

```json
"downloads": [
  { "label": { "pt": "Breakdown em PDF", "en": "Breakdown PDF" },
    "url": "https://drive.google.com/file/d/ID_DO_FICHEIRO/view?usp=sharing",
    "host": "drive", "sizeMb": 12, "placeholder": true }
],
"links": [
  { "kind": "artstation", "label": "ArtStation", "url": "https://www.artstation.com/artwork/…" }
]
```

Ficheiros grandes vão para o **Google Drive**, não para o repositório. O ficheiro tem de estar partilhado como público. Nunca põe credenciais do Google em nenhum ficheiro deste projeto.

Deixa `"placeholder": true` enquanto o link for de exemplo, e apaga essa linha quando for real — é assim que o `validate` sabe o que ainda falta.

---

## Trocar o showreel

Abre `content/showreel.json` e muda **uma linha**:

```json
"primary": { "provider": "youtube", "id": "O_NOVO_ID" }
```

Depois atualiza `durationSeconds`, `date` e a lista de `shots`. A duração alimenta ao mesmo tempo o rótulo do botão ("Reproduzir showreel 2026, 1 min 5 s"), a página de breakdown e os dados estruturados para o Google.

O `title` tem de continuar datado — **"Showreel 2026"**, não "Showreel". Um reel antigo com data lê-se como arquivo; sem data lê-se como negligência.

Os `shots` geram a página `/showreel/breakdown`, que serve três coisas ao mesmo tempo: alternativa textual para leitores de ecrã, conteúdo indexável pelo Google, e material para quem prefere ler a ver.

```json
"shots": [
  { "at": 3, "label": { "pt": "…", "en": "…" }, "project": "criatura-quadrupede", "roles": ["animation", "rigging"] }
]
```

`at` é o segundo em que o plano começa. `project` liga ao projeto (tem de existir; o `validate` verifica) ou é `null`.

**Não te esqueças do Vimeo.** O regulamento de estágios da Lusófona (art. 9.º) exige o showreel alojado no Vimeo. Está previsto em `mirrors`, à espera do ID real.

---

## Trocar os teus dados

Tudo em `content/site.json`:

- **contactos** — `author.email`, `author.phone`
- **título profissional** — `author.jobTitle`. Aparece na página inicial, nos dados estruturados e no CV. Um só título, nunca `3D • VFX • Animação`
- **disponibilidade** — `author.availability`. Põe `open: false` quando já tiveres estágio e o badge desaparece
- **redes sociais** — `social`. Enquanto uma conta não existir, deixa `"placeholder": true` e o link **não aparece** no site. Nada de links `href="#"`
- **CV** — `cv.pt.url` e `cv.en.url`, apontando para `public/docs/`. Máximo 500 KB cada
- **domínio** — `site.url`

E as competências em `content/about.json`. Duas regras que valem dinheiro:

1. **Sem barras de percentagem.** `Blender ████ 100%` é subjetivo e não prova nada. O site agrupa em `primary` / `secondary` / `exploring`.
2. **Nunca publicar nível "iniciante".** Uma ferramenta em que estás a começar vai para `"tier": "exploring"` com `"level": null`, e o site mostra apenas "a explorar". Publicar "iniciante" não acrescenta capacidade e subtrai credibilidade.

---

## Texto da interface

Botões, rótulos e avisos estão em `messages/pt.json` e `messages/en.json`. **As duas têm de ter exatamente as mesmas chaves** — se faltar uma, o `validate` falha e diz qual.

---

## Substituir as imagens de exemplo

As imagens em `public/media/` são placeholders gerados por script, com a palavra PLACEHOLDER. Quando tiveres as reais:

1. Substitui os ficheiros, mantendo os nomes (ou muda o `src` no JSON)
2. `npm run validate -- --fix` para acertar as dimensões
3. Apaga `scripts/gen-placeholders.py` — já não serve para nada

---

## Quando algo corre mal

| Sintoma | Onde olhar |
|---|---|
| O `validate` falha | Lê a mensagem: diz o ficheiro, o campo e o problema |
| O projeto não aparece no site | `status` está `"draft"`? |
| A categoria não aparece nos filtros | Não tem nenhum projeto publicado |
| A imagem não carrega | O `src` corresponde ao ficheiro em `public/`? Corre `validate` |
| O vídeo não aparece | Falta o `poster`, ou o `id` traz o URL inteiro em vez do identificador |
| Uma página está em inglês quando devia estar em português | Falta a chave `pt` nesse campo. O `validate` lista tudo o que está só num idioma |
| O deploy falhou | Vai a *Deploys* no Netlify e lê o log. Ver `DEPLOY.md` |
| Publiquei e está mau | *Deploys* → escolhe o deploy anterior → **Publish deploy**. É instantâneo |

---

## O que nunca fazer

- Pôr `.mp4`, `.mov`, `.blend`, `.fbx` ou `.zip` no repositório. Vídeos vão para YouTube e Vimeo, ficheiros grandes para o Google Drive
- Publicar um projeto sem `alt` nas imagens
- Publicar uma categoria vazia
- Publicar nível "iniciante" em qualquer ferramenta
- Reivindicar num projeto de grupo trabalho que foi de outra pessoa
- Pôr o número de matrícula, ou qualquer credencial, em ficheiro nenhum
