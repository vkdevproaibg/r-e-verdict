# Propa — Agent Flow Upgrade + Pricing Realism Fix

Цель: (1) исправить занижение цен в анализе через промпт, (2) превратить агентский режим из «ещё одной CRM» в инструмент продажи: быстрый разбор → client-ready материал → лёгкий pipeline.

Текущий визуальный язык (ivory/stone, graphite, champagne accent, large typography) сохраняем — никакого нового дизайн-направления не вводим.

---

## 1. Pricing realism fix (edge function `analyze`)

Сейчас модель часто отдаёт «fair price» ниже рынка, потому что промпт просит «справедливую цену» без якорения на актуальный рынок и без явного запрета занижать.

Что меняем в `supabase/functions/analyze/index.ts`:

- В системный промпт добавляем жёсткие правила:
  - Не занижать `fair_price_min/max` относительно asking price без явных рыночных доказательств. Default presumption: asking ≈ market, отклонение требует обоснования в `comparable_signals`.
  - `fair_price_max` обычно лежит в диапазоне asking × [0.92 … 1.05] для ликвидных рынков, отклонения вниз > 8% допустимы только если явный red flag (юрид., физический износ, локация, переоценка района) — и должны отражаться в `reasons`/`red_flags`.
  - Ориентироваться на свежие данные региона (2025–2026) и валюту листинга; не пересчитывать в USD молча.
  - Если данных недостаточно — поднимать `confidence` ниже 60 и помечать `manual_checks`, а не угадывать заниженную цену.
  - `suggested_first_offer` — не «фантазийный дисконт», а функция от `fair_price_min` и реальных рычагов из `red_flags`. Жёсткое правило: `suggested_first_offer ≥ fair_price_min × 0.95` если нет тяжёлых red flags.
- В user-prompt передаём явное напоминание о регионе/валюте и просим вернуть `price_proof.market_assumption_en` (одна строка: «based on …») — чтобы видеть, на чём построена оценка.
- Добавляем в schema поле `price_proof.market_assumption` (en/ru) и показываем его на ResultPage мелкой строкой под fair-range.

## 2. Agent flow drama (UI/UX)

Не ломаем текущий New analysis. Добавляем агентский слой поверх результата и лёгкий pipeline. Пять ключевых состояний:

### 2.1 Agent Home (`/agent`)
Заменяет текущий welcome-стиль на рабочий экран:
- Hero CTA «Разобрать объект для клиента» → ведёт в существующий AnalyzeHub.
- Под ним 3 секции: Recent objects (последние analyses), Clients (top-5), Quick actions (New client pack, New client).
- Если клиентов нет — second CTA «Создать share-link» вместо клиентского блока.

### 2.2 Add / Analyze Object
Используем существующий AnalyzeHub + SourcesBrowser. Менять не нужно — он уже принимает url/address/manual.

### 2.3 Agent Object Analysis (ResultPage в режиме agent)
Поверх buyer-секций добавляем agent-only блок «Client-ready разбор» в самом верху (после verdict-hero):
- **Что сказать клиенту первым** — 1 фраза (используем `agent_script.client_message`).
- **Сильные стороны** — top-3 reasons, перефразированные продающе.
- **Что честно подсветить** — top-2 red flags.
- **Объяснение цены** — короткий вывод из `price_proof` + `market_assumption`.
- **Где торг** — из `negotiation.arguments` top-2.
- **Следующий шаг** — 1 CTA-фраза.
- Tone toggle: `Neutral / Selling / Cautious` (3 чипа). Меняет только формулировки на клиенте, без повторного запроса к LLM на MVP — три варианта генерим в edge function сразу: `agent_script.tones = { neutral, selling, cautious }`.

Под блоком 2 главные действия:
- **Создать Client Pack** → `/agent/pack/:analysisId`
- **Поделиться ссылкой** → существующий SharePage flow

### 2.4 Client Pack Preview (`/agent/pack/:analysisId`)
Новый роут. Это не PDF, а живой экран — то, что увидит клиент по share-link:
- Шапка: фото/адрес объекта, цена, агент (имя из профиля или «Propa Agent» fallback).
- Verdict в мягкой форме (без score 78/100 — заменяем на «Стоит рассмотреть / Торговаться / Осторожно»).
- Что нравится / Что проверить / Цена и торг / Следующий шаг.
- Кнопки: Copy share-link, Open public view, Edit tone.
- На MVP без редактора текста — только tone toggle.

### 2.5 Client / Object Status (lightweight pipeline)
В существующей таблице `assignments` уже есть статусы. Добавляем UI:
- На ClientDetail — список объектов клиента с чипами статуса: `sent / viewed / interested / declined / offer`.
- Быстрая смена статуса кликом по чипу.
- На AgentHome — счётчики по статусам.

## 3. Onboarding lightening
Убираем требование заполнять профиль до первого анализа. Профиль/верификацию просим только перед:
- сохранить отчёт навсегда
- создать client pack
- создать share-link
- сохранить клиента

Реализация: в существующих guard'ах подменяем редирект на онбординг → инлайн-модалку «Завершите профиль, чтобы поделиться» с одним полем (имя) и кнопкой Continue.

## 4. Paywall точки (без реализации платежей сейчас)
Помечаем в UI premium-замком только:
- Create Client Pack
- Share-link
- Export PDF
- Save client
- Pipeline statuses
Сам payment flow — следующая итерация. Сейчас замок открывает modal «Premium feature — coming soon», чтобы зафиксировать точки монетизации.

---

## Технические изменения (файлы)

```text
supabase/functions/analyze/index.ts   — anti-lowball правила, market_assumption, agent_script.tones {neutral,selling,cautious}
src/pages/agent/AgentHome.tsx          — NEW: рабочий home с recent/clients/quick
src/pages/agent/AgentLayout.tsx        — роут на новый Home
src/pages/app/ResultPage.tsx           — agent-only "Client-ready" блок сверху + tone toggle + market_assumption
src/pages/agent/ClientPackPage.tsx     — NEW: /agent/pack/:id живой preview
src/pages/agent/ClientDetail.tsx       — статус-чипы на объектах
src/App.tsx                            — роут /agent/pack/:id, /agent home
src/components/PremiumLock.tsx         — NEW: общий замок-обёртка
src/i18n/locales/{ru,en}.json          — новые строки (agent.client_ready, tones, pack, statuses, paywall)
```

DB не трогаем — `analyses`, `assignments`, `clients` уже покрывают MVP.

## Что НЕ делаем сейчас
- Полноценный CRM, аналитика просмотров, публичный маркетплейс агентов, авто-публикации, глубокая верификация, редактор текста client pack, реальный payment flow.

## Критерии готовности
- На одном и том же объекте `fair_price_max` больше не уезжает на −20% от asking без поддержки в red flags; `market_assumption` виден в UI.
- Агент за ≤ 2 клика после анализа создаёт Client Pack и копирует share-link.
- Toggle тона переключает формулировки без повторного LLM-запроса.
- Buyer flow визуально не изменился.
