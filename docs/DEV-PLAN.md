# CHRONOS — Dev Plan
## Plano de Desenvolvimento por Fases

> Cada task é uma unidade de trabalho atômica. Execute sequencialmente dentro de cada fase.
> Formato: `[PHASE-TASK]` Nome — Descrição | Dependência | Critério de Done

---

## PHASE 0 — Setup & Scaffolding (Pré-requisito)

### P0-T01: Inicializar repositório Next.js
- Criar projeto com `npx create-next-app@latest chronos --typescript --tailwind --eslint --app --src-dir`
- Configurar `tsconfig.json` com `strict: true` e path aliases (`@/domain`, `@/application`, `@/infrastructure`, `@/shared`)
- Instalar dependências base: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `sonner`
- Instalar UI: `shadcn/ui` init com tema dark, instalar components: `button`, `input`, `card`, `dialog`, `table`, `badge`, `toast`, `dropdown-menu`, `tabs`, `select`, `textarea`, `skeleton`, `separator`, `sheet`, `command`
- **Done:** `npm run dev` funciona, estrutura de pastas criada, imports com alias funcionando.

### P0-T02: Configurar Supabase
- Criar projeto no Supabase Dashboard
- Configurar variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Criar `src/lib/supabase/server.ts` (server client) e `src/lib/supabase/client.ts` (browser client) seguindo SSR pattern do Supabase
- Criar middleware Next.js para refresh de sessão em `src/middleware.ts`
- **Done:** Cliente Supabase funcional em server e client components.

### P0-T03: Executar schema SQL
- Rodar `schema.sql` completo no Supabase SQL Editor
- Verificar todas as tabelas, enums, indexes, RLS policies, triggers e views criados
- Criar buckets de Storage: `watch-images`, `finance-attachments`, `marketing-assets`
- Configurar Storage policies para cada bucket
- **Done:** `SELECT * FROM information_schema.tables WHERE table_schema = 'public'` retorna todas as tabelas. RLS habilitado em todas.

### P0-T04: Estrutura de pastas Clean Architecture
- Criar estrutura completa:
```
src/
  app/
    (auth)/login/page.tsx
    (dashboard)/layout.tsx
    (dashboard)/page.tsx
    (public)/c/[slug]/page.tsx
    api/v1/
    layout.tsx
    globals.css
  domain/
    entities/
    value-objects/
    ports/
    services/
  application/
    use-cases/
  infrastructure/
    supabase/
    storage/
    ai/
    whatsapp/
    marketing/
  shared/
    errors/
    result.ts
    schemas/
    constants.ts
  lib/
    di.ts
    supabase/
```
- Criar `Result<T, E>` type em `shared/result.ts`
- Criar `DomainError` base class em `shared/errors/domain-error.ts`
- **Done:** Toda a estrutura existe, imports entre camadas respeitam as regras do `.cursorrules`.

### P0-T05: Composition Root (DI)
- Criar `src/lib/di.ts` com factory functions para instanciar use cases com suas dependências reais
- Padrão: cada use case tem uma `create{UseCaseName}()` function que recebe supabase client e retorna o use case wired
- **Done:** `container.resolve(CreateWatchUseCase)` ou `createCreateWatchUseCase(supabase)` funciona.

### P0-T06: Layout base e tema
- Configurar `tailwind.config.ts` com color tokens do Chronos (navy, gold, surfaces, text)
- Criar layout principal com sidebar de navegação (colapsável)
- Items de nav: Dashboard, Relógios, Clientes, Fornecedores, Financeiro, WhatsApp, Configurações
- Criar componentes base: `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`
- **Done:** Layout renderiza com sidebar, navegação funcional (links podem ir para páginas vazias).

---

## PHASE 1 — Fundação (Auth + Inventário + IA)

### P1-T01: Entity Watch
- Criar `src/domain/entities/watch.ts`
- Propriedades: todos os campos da tabela `watches`
- Métodos: `Watch.create()`, `Watch.fromPersistence()`, `toPersistence()`, `updateStatus()`, `publish()`, `unpublish()`
- Invariantes: não pode ir para `sold` sem ter preço > 0; não pode publicar em status `draft`
- Criar `WatchStatus` value object em `src/domain/value-objects/watch-status.ts`
- Criar `Money` value object (integer cents + formatação BRL)
- **Dep:** P0-T04
- **Done:** Testes unitários passam para criação, transição de status, e validações.

### P1-T02: Port IWatchRepository
- Criar interface em `src/domain/ports/i-watch-repository.ts`
- Métodos: `findById`, `findByOrgId` (paginado + filtros), `save`, `update`, `delete`
- Criar `WatchFilters` type: status, brand, text search, price range
- Criar `PaginatedResult<T>` generic type em shared
- **Dep:** P1-T01
- **Done:** Interface compilando, tipos exportados.

### P1-T03: SupabaseWatchRepository
- Implementar `IWatchRepository` em `src/infrastructure/supabase/supabase-watch-repository.ts`
- Mapear entre domain entity e database row
- Implementar full-text search com `to_tsvector` para busca por brand/model/reference
- Implementar paginação com cursor ou offset
- Implementar filtros (status, brand, price range)
- **Dep:** P1-T02
- **Done:** Repository funcional com Supabase, queries executam corretamente.

### P1-T04: Use Case — CreateWatch
- Criar `src/application/use-cases/create-watch-use-case.ts`
- Input: brand, model, referência, condição, acessórios, preço, descrição, org_id
- Validação com Zod schema
- Chama `watchRepo.save()`
- Log em audit_logs
- Retorna `Result<Watch, CreateWatchError>`
- **Dep:** P1-T03
- **Done:** Use case funcional, criação persiste no banco.

### P1-T05: Use Case — UpdateWatch
- Permitir edição de todos os campos editáveis
- Validar transições de status (usar state machine simples)
- Se status mudou, trigger automático gera history (via trigger SQL, mas validar aqui também)
- **Dep:** P1-T04
- **Done:** Edição funcional com validação.

### P1-T06: Use Case — ListWatches
- Query use case com filtros e paginação
- Retorna `PaginatedResult<Watch>`
- **Dep:** P1-T03
- **Done:** Listagem com filtros funcional.

### P1-T07: Auth — Login page
- Criar `src/app/(auth)/login/page.tsx`
- Form com email + senha, validação Zod
- Login via `supabase.auth.signInWithPassword()`
- Redirect para dashboard após sucesso
- Página visual premium com logo CHRONOS
- **Dep:** P0-T02
- **Done:** Login funcional, sessão persistida, redirect funciona.

### P1-T08: Auth — Middleware de proteção
- Middleware em `src/middleware.ts` que verifica sessão
- Rotas `/(dashboard)/*` requerem auth
- Rotas `/(public)/*` e `/(auth)/*` são públicas
- Verificar membership no org (via server component ou middleware)
- **Dep:** P1-T07
- **Done:** Rota protegida redireciona para login. Rota pública funciona sem auth.

### P1-T09: UI — Página de listagem de relógios
- `src/app/(dashboard)/relogios/page.tsx` (server component)
- Chamar `ListWatchesUseCase`
- Grid de cards com: imagem primária (ou placeholder), marca, modelo, preço, status badge
- Barra de busca + filtros (status dropdown, ordenação)
- Botão "Novo Relógio"
- Empty state quando não há relógios
- Loading skeleton
- **Dep:** P1-T06, P0-T06
- **Done:** Página renderiza lista de relógios com filtros funcionais.

### P1-T10: UI — Formulário de cadastro de relógio
- `src/app/(dashboard)/relogios/novo/page.tsx`
- Form com todos os campos: marca, modelo, referência, condição (select), acessórios, preço (input com máscara BRL), descrição (textarea), notas internas
- Upload de imagens: dropzone com preview, múltiplas fotos, drag-to-reorder, marcar primária
- Validação client-side com Zod
- Submit chama server action → `CreateWatchUseCase`
- Toast de sucesso/erro
- **Dep:** P1-T04, P1-T09
- **Done:** Cadastro completo funcional com upload de imagens.

### P1-T11: Port e Adapter — IImageStorage
- Interface: `upload(file, path)`, `getPublicUrl(path)`, `getSignedUrl(path)`, `delete(path)`
- Implementar `SupabaseImageStorage` no bucket `watch-images`
- **Dep:** P0-T03
- **Done:** Upload e retrieve de imagens funcionais via adapter.

### P1-T12: Use Case — UploadWatchImage
- Recebe arquivo + watch_id
- Faz upload via `IImageStorage`
- Cria registro em `watch_images` com sort_order e is_primary
- Se é a primeira imagem, marca como primary automaticamente
- **Dep:** P1-T11
- **Done:** Upload de imagens vinculadas a relógios funcional.

### P1-T13: Port e Adapter — IImageAnalyzer (IA)
- Interface: `analyzeWatch(imageUrl): Promise<Result<WatchSuggestions, AnalysisError>>`
- `WatchSuggestions`: { brand, model, reference, dial_color, case_material, movement, description, confidence_scores }
- Implementar `GeminiVisionAdapter` usando Gemini Vision API
- Prompt estruturado que pede JSON com os campos esperados + confidence %
- Fallback gracioso se API falhar (retorna Result.err, não quebra fluxo)
- **Dep:** P0-T04
- **Done:** Enviar imagem de relógio retorna sugestões estruturadas.

### P1-T14: Use Case — AnalyzeWatchImage
- Recebe image URL do relógio
- Chama `IImageAnalyzer.analyzeWatch()`
- Salva sugestões em `watches.ai_suggestions` (JSONB)
- Retorna sugestões para o frontend apresentar para confirmação
- **Dep:** P1-T13
- **Done:** Fluxo completo: upload → análise → sugestões retornadas.

### P1-T15: UI — Fluxo de IA no cadastro
- Após upload da primeira imagem, botão "Analisar com IA" aparece
- Loading state enquanto IA processa
- Sugestões aparecem nos campos com badge "Sugestão IA" e confidence %
- Usuário pode aceitar, editar ou ignorar cada sugestão
- Botão "Aceitar todas as sugestões" para preencher tudo de uma vez
- Ao salvar, marca `ai_suggestions_confirmed = true`
- **Dep:** P1-T14, P1-T10
- **Done:** Fluxo visual completo de upload → IA sugere → usuário confirma → salva.

### P1-T16: UI — Página de edição de relógio
- `src/app/(dashboard)/relogios/[id]/page.tsx`
- Mesmo form do cadastro, preenchido com dados existentes
- Permite editar todos os campos
- Permite alterar status via dropdown com confirmação
- Galeria de imagens: reordenar, mudar primária, deletar, adicionar novas
- Histórico de status no sidebar ou tab
- **Dep:** P1-T05, P1-T10
- **Done:** Edição completa funcional com transições de status.

### P1-T17: UI — Dashboard básico (home)
- `src/app/(dashboard)/page.tsx`
- Cards com contadores: rascunho, disponível, reservado, vendido, total
- Lista de atividade recente (últimos 10 relógios criados/atualizados)
- Valor total em estoque (soma asking_price dos disponíveis)
- Usar view `v_inventory_summary`
- **Dep:** P1-T06
- **Done:** Dashboard renderiza com dados reais.

---

## PHASE 2 — Vitrine Pública & Marketing

### P2-T01: UI — Vitrine pública
- `src/app/(public)/c/[slug]/page.tsx` (server component, sem auth)
- Query relógios do org com `is_public = true AND status = 'available'` (via RLS anon)
- Grid responsivo com cards de relógio: foto, marca, modelo, preço
- Header com logo/nome da coleção
- Design premium, dark theme, tipografia de luxo
- Meta tags para SEO e Open Graph
- **Dep:** P1-T03, P1-T08
- **Done:** URL pública renderiza catálogo sem login. Apenas relógios públicos aparecem.

### P2-T02: UI — Página de detalhe público
- `src/app/(public)/c/[slug]/[watchSlug]/page.tsx`
- Galeria de fotos com carousel
- Todos os detalhes públicos do relógio
- Botão "Consultar via WhatsApp" com link `wa.me/{phone}?text=Olá, tenho interesse no {brand} {model} ref. {reference}`
- **Dep:** P2-T01
- **Done:** Detalhe do relógio público funcional com botão WhatsApp.

### P2-T03: Port e Adapter — IMarketingAssetGenerator
- Interface: `generateCard(params): Promise<Result<GeneratedAsset, GenerationError>>`
- `GenerateCardParams`: watch data, primary image URL, format (photo_description | premium_card | visual_art), custom prompt override
- `GeneratedAsset`: { image_url, image_base64, text_content, prompt_used }
- Implementar `NanoBananaImageAdapter` usando fal.ai API (`fal-ai/nano-banana-pro`)
- 3 prompts base (um por formato), parametrizados com dados do relógio
- **Dep:** P0-T04
- **Done:** Chamar adapter com dados de relógio retorna imagem gerada.

### P2-T04: Prompts de marketing
- Criar 3 prompts base em `src/infrastructure/marketing/prompts.ts`:
  - **photo_description**: Foto do relógio com overlay de texto elegante (marca, modelo, preço)
  - **premium_card**: Card dark premium com foto, dados técnicos e preço em destaque
  - **visual_art**: Arte visual chamativa estilo anúncio de luxo com a foto como centro
- Cada prompt recebe variáveis: `{brand}`, `{model}`, `{reference}`, `{price}`, `{condition}`, `{description}`
- Os prompts devem ser editáveis pelo owner no futuro (fase 5), mas hardcoded agora
- **Dep:** P2-T03
- **Done:** 3 prompts produzem resultados visuais distintos e de qualidade.

### P2-T05: Use Case — GenerateMarketingAsset
- Input: watch_id, format, optional prompt override
- Busca watch + primary image
- Chama `IMarketingAssetGenerator.generateCard()`
- Salva resultado em Storage (`marketing-assets` bucket) e registra em `marketing_assets` table
- Retorna asset com URL
- **Dep:** P2-T03, P2-T04
- **Done:** Geração persiste imagem e registro no banco.

### P2-T06: UI — Geração de materiais
- Tab ou seção na página de detalhe do relógio (dashboard, não público)
- 3 botões: "Foto + Descrição", "Card Premium", "Arte Visual"
- Loading state com preview do formato sendo gerado
- Resultado: imagem gerada com botões "Download", "Copiar Texto", "Enviar WhatsApp"
- Galeria de materiais já gerados para este relógio
- **Dep:** P2-T05, P1-T16
- **Done:** Geração visual funcional com download e galeria.

### P2-T07: Dashboard — métricas expandidas
- Adicionar ao dashboard: relógios publicados, relógios com materiais gerados
- Gráfico simples: relógios adicionados vs vendidos por semana (últimas 8 semanas)
- Alerta: relógios sem foto, rascunhos há mais de 7 dias
- **Dep:** P1-T17
- **Done:** Dashboard com métricas adicionais e alertas.

---

## PHASE 3 — WhatsApp & CRM

### P3-T01: Entity Client
- `src/domain/entities/client.ts`
- Propriedades: name, phone, email, status, interest_tags, preferred_brands, budget range, stats
- Métodos: `Client.create()`, `fromPersistence()`, `toPersistence()`, `addInterestTag()`, `updateStats()`, `matchesWatch(watch: Watch): MatchScore`
- `matchesWatch` calcula score baseado em: brand match, price in budget, tags overlap
- **Dep:** P0-T04
- **Done:** Entity com matching logic funcional.

### P3-T02: Port e Adapter — IClientRepository
- Interface: `findById`, `findByOrgId` (paginado + filtros), `save`, `update`, `findMatchingClients(watch: Watch): Client[]`
- Implementar `SupabaseClientRepository`
- `findMatchingClients`: query que cruza preferred_brands com watch.brand, budget range com watch.asking_price, interest_tags com características
- **Dep:** P3-T01
- **Done:** Repository com matching query funcional.

### P3-T03: Use Cases — CRM
- `CreateClientUseCase`: cadastrar novo cliente com validação
- `UpdateClientUseCase`: editar dados e interesses
- `ListClientsUseCase`: listagem com filtros (status, tags, last_purchase)
- `MatchClientsForWatchUseCase`: dado um watch_id, retorna clientes ranked por match score
- **Dep:** P3-T02
- **Done:** Todos os use cases funcionais.

### P3-T04: UI — Página de clientes
- `src/app/(dashboard)/clientes/page.tsx`
- Listagem com: nome, telefone, status badge, tags como chips, total de compras, última interação
- Filtros: status, tags, busca por nome/telefone
- Botão "Novo Cliente"
- **Dep:** P3-T03
- **Done:** Listagem de clientes funcional.

### P3-T05: UI — Cadastro/edição de cliente
- Form: nome, telefone (WhatsApp), email, notas
- Seção de interesses: multi-select de tags predefinidas + custom, marcas preferidas (multi-select), budget range (min/max)
- Seção de notas/follow-ups
- Tab de histórico de compras (read-only, preenchido automaticamente)
- **Dep:** P3-T04
- **Done:** Cadastro e edição completos.

### P3-T06: UI — Match automático no detalhe do relógio
- Na página de detalhe do relógio (dashboard), seção "Clientes Interessados"
- Chamar `MatchClientsForWatchUseCase`
- Lista de clientes rankeados com match score visual (alta/média/baixa compatibilidade)
- Botão "Enviar para este cliente" em cada card
- **Dep:** P3-T03, P1-T16
- **Done:** Match automático visual funcionando.

### P3-T07: Port e Adapter — IMessageDispatcher (Evolution API)
- Interface: `sendMedia(params)`, `sendText(params)`, `getInstanceStatus()`, `getQRCode()`
- `SendMediaParams`: phone, imageUrl, caption (text)
- Implementar `EvolutionWhatsAppAdapter`
- Configuração: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`
- Implementar retry com exponential backoff (max 3 tentativas)
- Registrar cada envio na tabela `whatsapp_messages`
- **Dep:** P0-T04
- **Done:** Envio de imagem+texto via Evolution API funcional.

### P3-T08: Use Case — SendWhatsAppMessage
- Input: watch_id (optional), client_id (optional), recipient_phone, marketing_asset_id (optional), custom_text
- Se marketing_asset_id fornecido, busca asset e envia como mídia
- Se não, monta texto padrão com dados do relógio
- Chama `IMessageDispatcher.sendMedia()` ou `sendText()`
- Registra em `whatsapp_messages`
- Log em audit
- **Dep:** P3-T07
- **Done:** Envio rastreado e logado.

### P3-T09: Use Case — SendToGroup
- Input: watch_id, marketing_asset_id, group_phone/id
- Similar ao SendWhatsApp mas para grupo
- **Dep:** P3-T08
- **Done:** Envio para grupo funcional.

### P3-T10: UI — Painel WhatsApp
- `src/app/(dashboard)/whatsapp/page.tsx`
- Status da conexão (QR code se desconectado, verde se conectado)
- Histórico de mensagens enviadas (tabela com: data, destinatário, relógio, status, preview)
- Ação rápida: selecionar relógio → selecionar material → selecionar destinatário(s) → enviar
- **Dep:** P3-T08, P3-T09
- **Done:** Painel WhatsApp funcional com histórico.

### P3-T11: UI — Envio direcionado do detalhe do relógio
- Na seção "Clientes Interessados" (P3-T06), botão "Enviar" abre modal
- Modal: preview do material, seleção de formato, confirmação
- Envio individual ou multi-select de clientes
- Toast com status do envio
- **Dep:** P3-T06, P3-T08
- **Done:** Envio 1-a-1 para clientes interessados funcional.

### P3-T12: Vincular venda ao CRM
- Quando status do relógio muda para `sold`, prompt pede: "Quem comprou?"
- Modal de seleção de cliente (busca) ou "Cadastrar novo cliente"
- Cria registro em `client_purchases` automaticamente
- Atualiza stats do cliente (total_purchases, total_spent, last_purchase_at)
- **Dep:** P3-T03, P1-T05
- **Done:** Venda vinculada ao cliente automaticamente.

---

## PHASE 4 — Aquisição & Financeiro

### P4-T01: Entity Supplier + Acquisition
- `src/domain/entities/supplier.ts`: name, contact, type, stats
- `src/domain/entities/acquisition.ts`: type, cost, additional_costs, consignment details
- Value objects: `AcquisitionType`, `ConsignmentStatus`
- Invariantes: consignment requer deadline e commission_pct; acquisition cost > 0
- **Dep:** P0-T04
- **Done:** Entities com validações.

### P4-T02: Repositories — Supplier e Acquisition
- `ISupplierRepository` + `SupabaseSupplierRepository`
- `IAcquisitionRepository` + `SupabaseAcquisitionRepository`
- Query de consignações ativas próximas do vencimento (< 7 dias)
- **Dep:** P4-T01
- **Done:** Repositories funcionais.

### P4-T03: Use Cases — Aquisição
- `CreateSupplierUseCase`
- `CreateAcquisitionUseCase`: cria aquisição vinculada a watch + supplier
- `ListAcquisitionsUseCase`: com filtros por tipo, supplier, período
- `GetWatchMarginUseCase`: usa view `v_watch_margin` para calcular margem
- **Dep:** P4-T02
- **Done:** Use cases funcionais.

### P4-T04: UI — Fornecedores
- `src/app/(dashboard)/fornecedores/page.tsx`
- Listagem com: nome, tipo, total de compras, volume, última compra
- Cadastro/edição via modal ou página
- **Dep:** P4-T03
- **Done:** CRUD de fornecedores funcional.

### P4-T05: UI — Aquisição no fluxo de cadastro
- Na página de cadastro do relógio (ou como tab na edição), seção "Aquisição"
- Campos: fornecedor (select/search + "novo"), tipo (direta/consignação/troca), custo, custos adicionais, data
- Se consignação: prazo, comissão %, status
- Exibe margem bruta calculada em tempo real: preço de venda - custo - adicionais
- **Dep:** P4-T03, P1-T10
- **Done:** Aquisição integrada ao cadastro do relógio.

### P4-T06: Entity FinancialTransaction
- `src/domain/entities/financial-transaction.ts`
- Propriedades: direction, category, amount_cents, occurred_at, links (watch, supplier, client)
- Invariantes: amount > 0, idempotency_key unique
- **Dep:** P0-T04
- **Done:** Entity funcional.

### P4-T07: Repositories + Use Cases — Financeiro
- `IFinancialTransactionRepository` + `SupabaseFinancialTransactionRepository`
- `RegisterTransactionUseCase`: com idempotency key
- `ListTransactionsUseCase`: filtros por período, categoria, direção
- `GenerateDREReportUseCase`: agrega via `v_financial_summary`, retorna por período e categoria
- `ReconcileUseCase`: cruza vendas (watches sold) com inflows (revenue_sale) — flag mismatches
- **Dep:** P4-T06
- **Done:** Use cases financeiros funcionais.

### P4-T08: Auto-gerar transação financeira na venda
- Quando watch status → `sold` E existe `client_purchase`:
  - Auto-criar `financial_transaction` tipo `inflow` / `revenue_sale` com sale_price
  - Se acquisition existe, auto-criar `outflow` / `cogs_purchase` se ainda não existir
- Domain service: `RecordSaleDomainService` orquestra
- **Dep:** P4-T07, P3-T12
- **Done:** Venda gera automaticamente transações financeiras.

### P4-T09: UI — Página financeira
- `src/app/(dashboard)/financeiro/page.tsx`
- Tabs: Transações, DRE, Conciliação
- **Tab Transações**: listagem com filtros (período, categoria, direção), botão "Nova Transação" com form completo
- **Tab DRE**: relatório mensal com categorias agrupadas (receitas - custos = resultado), seleção de período, botão export CSV
- **Tab Conciliação**: lista de vendas sem transação financeira correspondente (flags)
- **Dep:** P4-T07
- **Done:** Área financeira completa funcional.

### P4-T10: Dashboard — métricas financeiras
- Adicionar: margem média das vendas do período, receita total, custo total, resultado
- Adicionar: top 3 relógios mais lucrativos
- Alerta: consignações vencendo em 7 dias
- **Dep:** P4-T07, P1-T17
- **Done:** Dashboard com visão financeira.

---

## PHASE 5 — Automação & Polish

### P5-T01: Digest diário WhatsApp
- Cron job (Supabase Edge Function ou Vercel Cron) que roda todo dia às 8h (BRT)
- Query relógios com status `available` e `is_public = true`
- Formata lista: emoji + brand + model + price por linha
- Envia para grupo(s) configurados em `organizations.whatsapp_group_ids` (novo campo)
- Log em `whatsapp_messages`
- **Dep:** P3-T09
- **Done:** Mensagem diária enviada automaticamente.

### P5-T02: Alertas avançados
- Relógios em estoque há mais de 30/60/90 dias (configurable)
- Consignações com prazo < 7 dias
- Clientes sem interação há mais de 60 dias
- Follow-ups pendentes (vencidos)
- Exibir na home dashboard como cards de alerta com ação sugerida
- **Dep:** P4-T10
- **Done:** Alertas renderizando no dashboard.

### P5-T03: Pipeline de vendas (Kanban)
- `src/app/(dashboard)/pipeline/page.tsx`
- Colunas: Lead → Contato → Negociação → Reservado → Vendido
- Cards de relógio arrastáveis entre colunas
- Arrastar muda status do relógio automaticamente
- Filtros por marca, preço, período
- **Dep:** P1-T05
- **Done:** Kanban funcional com drag-and-drop.

### P5-T04: Ranking de clientes
- View no dashboard ou página dedicada
- Top compradores por: volume total (R$), número de compras, frequência
- Filtro por período
- **Dep:** P3-T03
- **Done:** Ranking funcional.

### P5-T05: Export avançado
- Export de relógios: CSV com todos os campos
- Export de clientes: CSV
- Export de transações financeiras: CSV filtrado por período
- Backup completo: JSON com todos os dados (owner-only, via server action)
- **Dep:** P4-T07, P3-T03
- **Done:** Exports funcionais com download.

### P5-T06: Polish UX
- Revisão completa de loading states (skeleton em toda página)
- Revisão de empty states com ilustração/mensagem contextual
- Revisão de error states com mensagens claras
- Mobile responsive: sidebar colapsa em menu, tabelas viram cards
- Keyboard shortcuts: Ctrl+N (novo relógio), Ctrl+K (busca global)
- Onboarding: primeiro acesso mostra wizard simplificado
- **Done:** UX revisada e polida end-to-end.

### P5-T07: Multi-user
- Convite de usuários: owner pode convidar via email (Supabase `inviteUserByEmail`)
- Seleção de papel no convite (operator, readonly, finance)
- Página de configurações: listar membros, alterar papéis, revogar acesso
- Visibilidade financeira: `finance` e `owner` veem valores; `operator` vê sem preço de custo; `readonly` só visualiza
- **Done:** Multi-user funcional com papéis.

---

## REGRAS TRANSVERSAIS

### Para TODA task:
1. **Zod validation** em todo input que entra por API/server action
2. **RLS** está habilitado e funcional (testar com outro usuário)
3. **Loading state** em toda página/componente que faz fetch
4. **Error handling** com Result pattern, nunca throw para erros esperados
5. **Audit log** para ações sensíveis (criar/editar relógio, financeiro, WhatsApp)
6. **Toast** para feedback de ações (sucesso, erro)
7. **TypeScript strict** — zero `any` em código de produção

### Ordem de execução dentro de cada task:
1. Domain (entity/VO se necessário)
2. Port (interface)
3. Infrastructure (adapter/repository)
4. Use Case
5. Route handler ou server action
6. UI component/page
7. Testar end-to-end manualmente
