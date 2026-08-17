# Arthur Brabo — Plano Mestre v2.0

**Data:** 17 de agosto de 2026
**Substitui:** `arthur_brabo_portfolio_2.0_plano.md`
**Estado:** aprovado nas decisões de stack; pendente de validação de conteúdo

---

## Sumário executivo — o que mudou em relação ao plano v1

O plano v1 é bom no que faz. O problema é o que ele assume: que o gargalo é o site. Depois de seis avaliações independentes (recrutamento, direção de arte, arquitetura frontend, SEO/performance, acessibilidade, DevOps) e de uma rodada de revisão crítica, a conclusão é outra.

**O gargalo não é o site. É a inexistência de showreel e de ArtStation.**

Hoje, a candidatura do Arthur tem esta forma: um CV com os placeholders literais *"Adicionar link do ArtStation"* e *"Adicionar link"* no campo de showreel, apontando para um site de 2023 onde a categoria "Animação" está vazia. Na triagem real de um estúdio isto não é um portfólio incompleto — é uma candidatura que se autoexclui em menos de 20 segundos. Um portfólio de animação sem uma única imagem em movimento lê-se como candidatura para outra profissão.

A hierarquia real de decisão para um estagiário nas áreas dele é: **(1)** qualidade do reel nos primeiros 10 segundos; **(2)** evidência de craft técnico — topologia, UVs, hierarquia de rig, curvas de animação; **(3)** foco/especialização legível; **(4)** fiabilidade e comunicação; **(5)** o site; **(6)** o CV; **(7)** a universidade, irrelevante.

O site é o quinto fator. Não gera interesse — **converte-o**. Por isso este documento deixa de ser um plano de site e passa a ser um plano de lançamento, no qual o site é um componente entre seis, sujeito a uma regra dura: **o site nunca bloqueia nada.**

### A nuance que salva o site (parcialmente)

Há um contra-argumento legítimo: o desenvolvimento não sai do orçamento de tempo do Arthur, sai do seu. Verdade — mas apenas em parte, e vale enunciar os três limites:

1. O site não custa horas do Arthur, custa a **atenção** do Arthur: seleção de peças, exportação de assets, textos, aprovação de tom. É um imposto sobre o recurso escasso.
2. A sua atenção também não é gratuita. A tarefa de maior retorno que o senhor pode fazer *sem* o Arthur não é escrever `proxy.ts` — é produção: a lista de estúdios, os emails, os follow-ups, a conversa com o coordenador de estágios da Lusófona. Se essas horas forem para arquitetura, o gargalo real fica sem dono.
3. Um site em construção é a desculpa mais eficaz do mundo para não publicar um reel imperfeito. *"Lanço quando o site estiver pronto"* é procrastinação com aparência de diligência.

**Alocação recomendada de esforço: ~20% site, ~80% reel + ArtStation + contacto direto.** A stack decidida (Next.js 16) mantém-se; muda o momento em que entra e o peso que carrega.

---

## 1. Posicionamento — a decisão que não podemos tomar sem ver o trabalho

O plano v1 propõe *"3D Artist & Animator — 3D • Animation • VFX • Cinematics"*. Quatro disciplinas, quatro pipelines, quatro equipas diferentes que contratam. Isto é generalismo fatal: comunica que o candidato não sabe nomear a vaga que quer, e ninguém contrata para uma vaga que o próprio candidato não nomeou.

A equipa dividiu-se, e a divisão é instrutiva:

| Proposta | Argumento a favor | Argumento contra |
|---|---|---|
| **Character & Creature Artist** | É onde ele tem material diferenciado (criatura não humanoide modelada + riggada + animada); disciplina com vagas nomeadas em jogos e VFX; rigging júnior competente é escasso | **Não há ZBrush no perfil.** Substance está em iniciante/intermédio, Blender em iniciante. Em 2026 não se entra como character artist sem sculpting. É a maior população de portfólios do planeta |
| **Stop Motion Animator** | Dragonframe intermédio/avançado num recém-formado é raríssimo em Portugal; o nicho europeu contrata por demonstração de timing, não por diploma | Mercado pequeno e geograficamente concentrado (Manchester, Tallinn, Bristol, França) |
| **Animador 3D de personagem, estilo cel-shaded / anime** | Maya intermédio/avançado + materiais toon já no currículo + **Japonês B1**. Nicho em crescimento, posicionamento defensável e quase vazio de concorrentes portugueses | Depende inteiramente da qualidade real das curvas de animação dele |

### Recomendação

**Afirmação principal: Animador — animação 3D de personagem e stop motion. Lisboa.**
Character/creature art entra como *competência demonstrada*, não como título reivindicado, até haver prova de sculpting.

O ângulo **cel-shaded/anime + japonês** é a ideia de posicionamento mais valiosa que saiu de toda a avaliação e não estava no plano v1. Não é uma via de emprego no Japão (salários de entrada baixos, visto exige patrocínio, estúdios pedem N2/N1) — é um **diferenciador em coproduções, localização e estúdios europeus que produzem em estética anime**. Vale explorar se o material o suportar.

### O que resolve a dúvida: três ficheiros, não uma conversa

Nenhum dos seis avaliadores viu uma única imagem do trabalho do Arthur. Antes de fixar posicionamento, precisamos de:

1. Um **playblast com o Graph Editor visível** — revela em segundos se ele sabe animar ou apenas posar.
2. Um **turntable com wireframe** — revela topologia e UVs.
3. Um **plano de stop motion cru**, sem edição.

Isto decide em dez minutos aquilo que a equipa debateu sem dados.

### E se o trabalho for mediano?

O plano tem de ser robusto a essa possibilidade. Dois objetivos que o plano v1 fundiu e que convém separar:

- **As 250 horas de estágio são um patamar baixo.** São seis a sete semanas, absorvíveis por qualquer produtora pequena, e ganham-se muitas vezes por recomendação de um professor — não por portfólio brilhante.
- **A carreira é o patamar alto** e é aí que a qualidade decide.

Se o trabalho for mediano, o plano B **não** é melhor apresentação. É mudar de alvo: previz/layout, motion graphics para publicidade, assistente de set e props em stop motion, técnico de pipeline. Todas estas funções empregam trabalho mediano com boa fiabilidade. Nenhuma emprega um portfólio que se anuncia como creature artist e não é.

---

## 2. Quem é o dono — o risco maior do projeto

O portfólio é do Arthur. O plano está a ser feito pelo senhor. Não existe, neste momento, nenhuma evidência direta do que o Arthur quer, do que ele considera o seu melhor trabalho, ou de que especialidade lhe interessa.

E já existe um sintoma: **a categoria "Animação" está vazia no site atual.** Isso não é uma falha de arquitetura. É a assinatura de um projeto sem dono a alimentá-lo. Reconstruir a mesma estrutura com melhor tipografia tende a produzir o mesmo resultado.

### Condições de entrada, antes de qualquer linha de código

**Todas as contas no nome e no email do Arthur:** domínio, GitHub, Netlify, Vimeo, YouTube, ArtStation, LinkedIn. Sem exceções. Um portfólio nas contas do pai é um portfólio que o filho não pode manter nem levar consigo.

**Quatro entregas do Arthur em 14 dias:**

1. Cinco linhas escritas por ele sobre a função que quer.
2. Uma pasta com 15 assets, ordenados por ele, do melhor para o pior.
3. Um *rough cut* do reel editado por ele — mesmo feio, mesmo sem música.
4. Um projeto publicado por ele no ArtStation.

Isto não é um teste de merecimento. É diagnóstico: mede se existe motor. Se as quatro entregas não chegarem em 14 dias, o problema não é o site e construir um site não o resolve.

---

## 3. Risco de abandono — e o que fazer quanto a isso

O dado mais preditivo que temos não é o CV nem o plano. É o histórico do repositório: **14 commits, seis semanas de atividade, morto desde 13 de janeiro de 2023, três anos e sete meses parado.**

O projeto de 2023 não morreu por má arquitetura. Morreu por ausência de forçante externa. Isso significa que "um plano melhor" é a resposta errada — e um plano *maior* aumenta o risco de repetição.

Três mecanismos que reduzem esse risco:

**Uma data externa dura.** O senhor indicou que o prazo académico não é o driver. Compreendido — mas vale reconsiderar, porque o regulamento oferece de graça a única forçante externa disponível: **30 de setembro de 2026**, a segunda fase de entrega. Se o estágio já estiver resolvido, é preciso substituir essa data por outra igualmente pública (um festival, uma candidatura concreta com deadline, uma revisão paga de portfólio já agendada). Sem data externa, este plano herda a mortalidade do anterior.

> **Ponto a confirmar:** a sua resposta ("o estágio já está resolvido ou não é o driver") é ambígua. Se o estágio **já está** garantido, muda a prioridade — o plano passa a otimizar para o primeiro emprego e o prazo relevante torna-se o fim do estágio. Vale esclarecer antes de executar.

**Um artefacto público por semana.** Um post no ArtStation, um plano do reel, uma página publicada. Nada que exista apenas num branch conta — só o público cria catraca social.

**O Arthur tem de poder contribuir.** Reescrever numa stack que ele não domina garante que ele não participa nem simbolicamente. Mitigação concreta: o conteúdo é MDX e pastas de imagens, para que acrescentar um projeto seja arrastar ficheiros e escrever texto. Ver secção 5.

---

## 4. Sequência de execução

### Fase 0 — Rede de segurança (dias 1–2, pai sozinho, ~2 h)

Antes de escrever uma linha de Next.js. Detalhe em `01_AUDITORIA_DEPLOY_NETLIFY.md`.

- Ativar notificação de **deploy falhado** por email no Netlify.
- Ler e copiar para o repositório a configuração de build que hoje só existe na UI do Netlify.
- Commitar ou reverter o `yarn.lock` modificado; criar a tag `pre-nextjs`.
- Confirmar que o *auto publishing* não está bloqueado e que a branch de produção é `main`.
- Comprar o domínio (`arthurbrabo.com` ou equivalente) **no nome do Arthur**.

### Fase 0-B — Diagnóstico de conteúdo e contactos quentes (dias 1–14)

**Dono: Arthur.** Em paralelo com a Fase 0. Checklist em `02_CHECKLIST_ARTHUR.md`.

- As quatro entregas da secção 2.
- **Em simultâneo, os 20 contactos quentes:** docentes, colegas de anos anteriores já colocados, coordenação de curso, EVA (Gabinete de Estágios). Este é o canal com maior taxa de conversão de todos, converte muito acima de candidaturas frias, e **não depende de existir reel, site ou ArtStation.** Não há razão nenhuma para esperar.

> ### ⛔ PORTÃO 1 — dia 14
> **Se as quatro entregas não chegarem, para.** Não se escreve site. O orçamento vai para três horas de revisão de portfólio paga, feita por um profissional ativo da indústria, entregue diretamente ao Arthur. Reavaliar depois disso.

### Fase 1 — Reel, ArtStation, CV, landing (semanas 3–5)

Esta é a fase que decide o resultado.

| Entregável | Dono |
|---|---|
| **Showreel de 50–70 s** no **Vimeo** (exigido pela universidade) + espelho no YouTube. Spec na secção 6 | Arthur |
| **ArtStation com três projetos completos** — turntables, wireframes, layouts de UV, mapas. É onde os *leads* procuram | Arthur |
| **CV limpo:** fora o número de matrícula (A22204108), fora "Blender — Iniciante", competências de 16 para 5, links reais, um título único. ~2 h, retorno desproporcionado | Arthur, revisão do pai |
| **Landing page de uma só página** no domínio próprio: nome, disciplina, disponibilidade, reel embebido, CV, ArtStation, email. Instrumentada com Plausible desde já, para que os UTM da Fase 2 tenham onde aterrar | Pai |

**Marco verificável:** um estranho chega do domínio ao reel em **um clique**.

### Fase 2 — Contacto frio (semanas 6–9, e depois em contínuo)

**Dono: Arthur na escrita, pai na investigação e no follow-up.**

Os contactos quentes já foram feitos na Fase 0-B. Esta fase é o alcance frio:

- Produtoras portuguesas do diretório da Portugal Film Commission, estágio de 3D Artist da Funcom Lisboa, estúdios de stop motion europeus (Mackinnon & Saunders, Nukufilm, Aardman Academy), ScreenSkills no Reino Unido.
- Alvo: **60 contactos**, não seis.
- Email frio: assunto com disciplina e disponibilidade; cinco linhas; link do reel na primeira linha com marca temporal do melhor plano; uma frase que prove que viu o trabalho *deles*; sem anexos no primeiro contacto; enviar ao nome de uma pessoa, nunca a `info@`; um follow-up após dez dias.
- Instrumentar cada candidatura com `?utm_source=candidatura&utm_campaign=estudio-x` — é o único modo de ligar visita a oportunidade nominalmente.

> ### ⛔ PORTÃO 2 — quando o 60.º contacto tiver saído (previsivelmente ~dia 65)
> **Critério: 60 contactos enviados e zero respostas significa que o problema é o trabalho, não o funil.** Nesse caso: parar de construir, produzir duas peças novas dirigidas ao estilo de um estúdio concreto, e não tocar no site.
>
> O portão é definido pelo **contador de contactos**, não pelo calendário — se ao dia 60 só saíram 25 emails, o portão ainda não abriu.

### Fase 3 — Site Next.js (a partir da semana 10, só depois dos dois portões)

Especificação técnica completa em `03_ESPECIFICACAO_TECNICA.md`.

**Dono: pai no código, Arthur no conteúdo e na aprovação de tom.**

- 6 peças na home, **2 case studies profundos** (ver secção 5).
- Bilíngue: interface em pt-PT e en; conteúdo longo em inglês (ver secção 5).
- Migração num branch com deploy preview; produção intacta até validação; rollback por *Publish deploy*.

### Fase 4 — Manutenção (contínuo)

Ritual realista: duas vezes por ano, 45 minutos. Ver secção 8 de `01_AUDITORIA_DEPLOY_NETLIFY.md`.

---

## 5. Correções ao plano v1, item por item

| Tema | Plano v1 | Plano v2 | Razão |
|---|---|---|---|
| **Posicionamento** | "3D Artist & Animator — 3D • Animation • VFX • Cinematics" | "Animador — animação 3D de personagem e stop motion" + explorar ângulo cel-shaded/JP | Generalismo em quatro disciplinas afasta; character artist sem ZBrush não é sustentável |
| **Ordem de prioridades** | Site primeiro (fases 0–8 todas sobre o site) | Reel e ArtStation primeiro; site na fase 3 | O site converte, não gera |
| **ArtStation** | Mencionado como "descoberta externa" | **Canal principal de avaliação técnica**, prioridade 2 | É onde os leads procuram |
| **Vimeo** | Não mencionado | Obrigatório (regulamento DCAM art. 9º) + espelho YouTube | Exigência formal da universidade |
| **Número de case studies** | 5–8 projetos, todos com case study completo | 6 peças na home, **2 case studies profundos**, resto agrupado em "Studies & Foundations" | Quando ele mudar de especialidade em 2 anos, 5–8 case studies profundos são passivo, não ativo. E 2 excelentes convertem melhor que 8 medianos |
| **Bilinguismo** | "no futuro, CV PT e EN" | Interface pt-PT/en desde o início; **conteúdo longo só em EN** | 12–20 textos de 300–600 palavras traduzidos por um estudante que ainda não editou o reel não é realista. Ninguém penaliza um breakdown em inglês; um breakdown em português desatualizado penaliza |
| **Modelo de conteúdo** | MDX ou TS, com `npm run new-project` e `npm run validate` | **MDX + pasta de imagens com o mesmo slug.** Validação mínima no build. Sem script gerador | Teste: *o Arthur consegue acrescentar um projeto sozinho, num sábado, dentro de dois anos, sem se lembrar de nenhum comando?* Se a resposta exige um gerador, a arquitetura está errada |
| **Roteamento** | `hash` (herdado) | Rotas reais com prefixo de locale | Hash-mode nunca gerou uma única URL indexável |
| **Cor de destaque** | Escolher entre 5 candidatas | **#FF6A3D como preenchimento com texto escuro.** Nunca laranja+branco (2,85:1, falha AA) | Cálculo de contraste na secção 7 |
| **Texto muted** | #6F7582 | **#8A91A0** | #6F7582 dá 3,71–4,31 e falha AA (4,5:1) em todos os fundos propostos |
| **Bordas** | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.07)` para separadores decorativos; **#6F7582 sólido** para qualquer componente funcional | Alfa de 0,07–0,08 dá ~1,15:1 e falha o critério 1.4.11 (3:1) |
| **Vídeo** | YouTube com iframe, evitando 10 simultâneos | **Fachada clicável obrigatória**, sempre | Um embed do YouTube pesa ~1,2 MB em 20+ requisições antes de qualquer clique |
| **Imagens OG** | "imagem OG específica do projeto" | Imagens **estáticas curadas** por projeto, 1200×630, <300 KB. Não gerar com `ImageResponse` | A imagem partilhada É o produto; crop automático decapita composições que o artista enquadrou |
| **Cursor personalizado** | "possibilidade" | Só como adorno sobre o cursor real; nunca esconder o cursor do sistema; desligado em `prefers-reduced-motion` e `pointer: coarse` | Esconder o cursor prejudica utilizadores com baixa visão e tremor |
| **Google Maps na página de contacto** | Herdado do site atual | **Remover.** Substituir por "Lisboa, Portugal (UTC+1)" | Não acrescenta nada e transfere IP para a Google, exigindo consentimento prévio |
| **Número de matrícula** | Exibido na home (herdado) | **Remover do site e do CV** | Identificador institucional sem função pública; minimização de dados (RGPD art. 5(1)(c)) |
| **Analytics** | "só depois do MVP" | Plausible (cookieless) desde o dia 1, com eventos de conversão | Sem cookies não há banner de consentimento; e sem dados desde o início não há linha de base |
| **CMS** | Não implementar | Confirmado: não implementar | Correto no v1 |

### Sobre-engenharia — o que cortar do plano v1

Para um site com 6 a 10 projetos, tocado poucas vezes por ano por uma pessoa, isto é teatro de engenharia e sai:

- `npm run new-project` (gerador de scaffolding)
- JSON Schema gerado a partir de Zod para autocomplete
- GitHub Actions como gate de merge
- Branch protection e CODEOWNERS num repositório de um autor
- Renovate/Dependabot com regras de agrupamento
- Content Security Policy escrita à mão e aplicada de imediato
- 4 case studies profundos

Isto fica, porque é engenharia a sério e custa uma manhã:

- `netlify.toml` versionado + script `build` no `package.json`
- Versão de Node fixada (`.nvmrc`) e lockfile determinístico
- Notificação de deploy falhado
- Tag `pre-nextjs` como âncora de rollback
- Validação leve do frontmatter dos projetos, a falhar o build (≈40 linhas)
- CSP em modo `Report-Only` primeiro, promovida a aplicada depois de um mês sem incidentes

O custo insidioso da sobre-engenharia não é o tempo de construção — é criar um sistema que só o senhor sabe operar e que transfere o portfólio do Arthur para a sua propriedade operacional.

---

## 6. Especificação do showreel

Duração: **50–70 segundos.** Nunca acima de 90. Para um júnior, 30–60 s de trabalho excelente bate 3 minutos de trabalho médio.

| Tempo | Conteúdo |
|---|---|
| 0–3 s | Cartela estática: nome, disciplina, email. Sem animação de logo |
| 3–15 s | O melhor plano absoluto, sem introdução |
| 15–40 s | Turntables (criatura, personagem) com wireframe a meio da rotação; passes de textura |
| 40–55 s | Rig a deformar (o resultado, não a UI do Maya); plano de stop motion se for forte |
| 55–65 s | Cartela final: nome, email, URL do site, ArtStation. Parada 4 segundos |

**Cortar impiedosamente:** bouncing ball, walk cycles genéricos, storyboards de fotografia (não pertencem ao reel), qualquer plano que exija desculpa, trabalho de grupo sem indicação da sua parte.

**Breakdown:** sim, mas fora do reel. Uma linha de texto discreta no canto ("Modelação, UV, texturização, rig, animação — Maya, Substance") e o detalhe no ArtStation.

**Música:** uma faixa licenciada, mixada baixa, sem letra, sem cortes ao ritmo da batida. Ele faz sonoplastia — um design sonoro sóbrio próprio é um diferenciador silencioso.

**Formato:** 1920×1080, H.264, 24 fps, 15–20 Mbps.

**Distribuição:** Vimeo como principal (obrigatório pelo regulamento, e é o padrão cultural da indústria — sem anúncios nem recomendações a roubar o candidato); YouTube como espelho, para indexação e para redes corporativas restritivas. Embeber o Vimeo no site.

**Acessibilidade:** ficheiro `.vtt` com `[Música: título — artista]` cumpre o critério 1.2.2. A alternativa textual razoável (1.2.3) é uma página de breakdown de planos com timecodes — que serve simultaneamente de conteúdo indexável e de material de leitura para recrutadores. Dois coelhos.

**Longevidade:** o reel tem meia-vida de doze meses. O ID do vídeo tem de ser um valor de configuração, nunca embutido num componente, e o título tem de estar datado visivelmente ("Showreel 2026") para que um reel antigo se leia como arquivo e não como negligência.

---

## 7. Direção de arte — correções

O "dark cinematic" do plano v1 é o default previsível de todo o portfólio 3D, mas é default por razões válidas: fundo escuro maximiza contraste percebido em renders com luz dramática, esconde as bordas do vídeo e não compete com o artwork. Mantém-se, com duas correções:

**Despolarizar o cinza.** Os valores do v1 são azulados e os renders já tendem a frio — fundo frio anula-os. Passa a grafite quase-neutro:

```
Background        #0A0A0B
Surface           #131316
Surface elevated  #1B1B1F
Border decorativa rgba(255,255,255,0.07)
Border funcional  #6F7582        (3,71–4,28:1 — passa 1.4.11)

Text primary      #F5F7FA        (16,00–18,44:1 ✓ AA)
Text secondary    #A6ACB8        (7,53–8,68:1   ✓ AA)
Text muted        #8A91A0        (5,43–6,26:1   ✓ AA)  ← corrigido de #6F7582
Accent            #FF6A3D        (6,03–6,96:1   ✓ AA)
```

**Superfície como token por projeto, não como constante.** O invólucro (nav, índice, footer) é sempre escuro. Cada página de projeto herda uma de três superfícies:

| Token | Valor | Para que trabalho |
|---|---|---|
| `dark` | `#0A0A0B` | Criatura, lighting, VFX |
| `mid` | `#1B1B1F` | Stop motion — a superfície mais alta dá presença física aos sets e puppets sem os afundar |
| `light` | `#F2F1EE`, texto `#16171A` (15,87:1) | Trabalho toon e animação 2D |

Trabalho toon e 2D é chapado e saturado, e vibra mal sobre grafite frio. Não é inconsistência; é o que uma galeria faz, dando a cada sala a luz que a obra pede.

**Regras de uso do laranja #FF6A3D**, derivadas do cálculo de contraste:

- Como **texto sobre fundo escuro**: ✓ (6,03–6,96:1)
- Como **preenchimento de botão**: texto por cima tem de ser **#0A0A0B** (6,96:1). Nunca branco — branco sobre laranja dá **2,85:1** e falha AA
- Em **superfície clara**: proibido como texto, link, ícone ou borda. `#FF6A3D` sobre `#F2F1EE` dá **2,52:1** e falha até 3:1. Só serve como massa de cor, com texto quase-preto por cima. Se for indispensável como texto, `#C2410C` dá 4,59:1 — passa AA, mas por margem fina; não usar abaixo de 16 px

**Tipografia:** substituir Space Grotesk (saturado no portfólio de dev, e o carácter geométrico briga com renders). Trio recomendado: **Archivo Expanded** SemiBold para display, **Inter** 16/1.6 para corpo, **JetBrains Mono** 12–13 px uppercase para metadados, especificações e créditos. O mono é o que dá credibilidade técnica sem recorrer a neon.

**Hierarquia da home:** o showreel estava enterrado no v1. Nova ordem: hero curto (60–70 vh) com loop silencioso de 8 s → **showreel imediatamente** → selected work (6 peças) → capabilities → sobre, curto → contacto no footer. Antes de rolar, o visitante tem de ver: nome, disciplina, uma imagem que prove o nível, e o caminho para o reel.

**Créditos em trabalho de grupo** — formulações concretas, porque esconder é o erro e declarar é a força:

- Metadados: `Equipa de 4 · O meu papel: modelação e rigging da criatura, look dev toon`
- Legenda: `Plano final — animação minha; ambiente de [Nome].`
- Nunca "colaborei em" ou "participei". Verbo + entregável + número: `Riggei uma criatura quadrúpede: 58 controlos, 6 blendshapes faciais.`
- Peça individual: dizê-lo explicitamente — `Peça individual, do concept ao render.`

Um recrutador desconta trabalho académico que descobre por si; declarado, avalia só o craft e ainda ganha contexto de prazo.

---

## 8. Métricas — o que medir e o que ignorar

A métrica que importa não é visitas. É **quantas visitas geraram uma oportunidade profissional**. O funil real: visita → viu trabalho → viu o reel → pediu contacto.

Eventos a instrumentar no Plausible: `showreel_play`, `project_view` (com prop `slug` — revela que projeto vende), `project_scroll_75`, `cv_download`, `contact_email_click`, `outbound_click` (com prop `destination`), `language_switch` (valida se a deteção automática acerta).

Métrica-norte: **taxa de `contact_*` ou `cv_download` por sessão, segmentada por referrer.** Se 200 visitas do LinkedIn dão 3 downloads de CV e 40 visitas de um Discord de estúdio dão 5, a resposta estratégica é óbvia.

Seja honesto sobre o SEO: o volume de busca por "Arthur Brabo" é de dezenas por mês. **O SEO aqui não é canal de aquisição, é infraestrutura de conversão.** O valor real está em (a) defender o nome próprio, para que quem receba o CV e pesquise o nome encontre o portfólio em primeiro lugar, e (b) rich previews de links partilhados — porque este site é consumido como um link aberto no telemóvel por alguém que decide em 8 segundos.

---

## 9. O que NÃO fazer

- Não esperar pelo site para começar a candidatar-se.
- Não reivindicar "Character Artist" sem sculpting demonstrado.
- Não usar o headline de quatro disciplinas.
- Não criar contas em nome do pai.
- Não traduzir os breakdowns longos para português.
- Não escrever 4 case studies profundos; escrever 2 excelentes.
- Não reescrever o histórico do Git para remover os 7,9 MB de binários — risco desnecessário num repositório de um autor, e invalida SHAs e a ligação de deploys antigos.
- Não construir gerador de scaffolding, GitHub Actions como gate, ou CSP aplicada de imediato.
- Não publicar categorias vazias. Se não há conteúdo, não há tab.
- Não publicar níveis de "iniciante" em ferramenta nenhuma.

---

## Documentos que acompanham este plano

| Ficheiro | Conteúdo |
|---|---|
| `01_AUDITORIA_DEPLOY_NETLIFY.md` | Estado da automação de publicação, guião de verificação no painel Netlify, `netlify.toml` alvo, plano de migração e rollback |
| `02_CHECKLIST_ARTHUR.md` | As quatro entregas do Portão 1, especificação de assets, checklist de curadoria |
| `03_ESPECIFICACAO_TECNICA.md` | Stack, i18n resolvido, modelo de conteúdo, mídia, acessibilidade, SEO, checklist de lançamento |
