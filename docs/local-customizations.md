# Local Customizations Ledger

This file records local product customizations that must be preserved when merging upstream open-source changes.

## How To Use

- Read this file before every upstream merge or rebase.
- Treat each entry as a behavior contract, not just a patch to keep verbatim.
- If upstream refactors the touched code, re-apply the behavior in the new structure and update the affected file list.
- Add a new entry whenever a user-facing local customization is made.

## Entries

### 2026-05-27 — Auth Legal Consent Attention Prompt

**Behavior to preserve:** When user agreement or privacy policy consent is required on login or registration, primary login/register and OAuth/passkey/WeChat actions must remain clickable enough to show feedback. If the user attempts to continue without checking consent, the consent area must visibly shake, switch to an error-highlight state, and show an inline reminder to agree before continuing. This behavior must exist in both default and classic frontend themes.

**Affected files:**

- `web/default/src/features/auth/components/legal-consent.tsx`
- `web/default/src/features/auth/components/oauth-providers.tsx`
- `web/default/src/features/auth/sign-in/components/user-auth-form.tsx`
- `web/default/src/features/auth/sign-up/components/sign-up-form.tsx`
- `web/default/src/styles/index.css`
- `web/classic/src/components/auth/LoginForm.jsx`
- `web/classic/src/components/auth/RegisterForm.jsx`
- `web/classic/src/index.css`

**Upstream merge notes:**

- Do not restore disabled-only behavior for legal consent. Keep the action handlers as the guard point so users receive visible guidance after clicking.
- Keep OAuth, passkey, WeChat, username/password login, and username registration covered by the same consent prompt.
- Preserve the reduced-motion fallback by disabling the shake animation when `prefers-reduced-motion: reduce` is active.

**Validation:**

- `cd web/default && bun run typecheck`
- `cd web/default && bun run build`
- `cd web/classic && npm run build`

### 2026-05-26 / 2026-05-28 — Quick Exchange And Click Contact

**Behavior to preserve:** The default home page must expose quick redemption and customer-service contact actions for both logged-in and logged-out users. Quick redemption posts to the local Go backend `/api/quick_exchange`, creates or reuses the derived account from the redemption code prefix, redeems the code, returns the API key and same-origin Base URL values, and points users to Model Square for model selection instead of hard-coding recommended models. The quick-exchange dialog must warn that Quick Exchange is for first-time setup and generates a new account; users who want to recharge an existing account should sign in to that account and redeem from Wallet instead.

All WeChat customer-service buttons/links touched by this customization must show the QR code in-place on click and must not navigate to a new tab. Do not open or close these contact popovers on hover/focus, because hover-position feedback caused flicker in the home/header UI. The popover must include an explicit close button. The default-theme popover must show the WeChat ID `deepseek998877`, QR code, and a copy button.

**Affected files:**

- `controller/quick_exchange.go`
- `service/quick_exchange.go`
- `router/api-router.go`
- `web/default/src/components/copy-button.tsx`
- `web/default/src/components/wechat-support-popover.tsx`
- `web/default/src/components/layout/constants.ts`
- `web/default/src/components/layout/components/nav-link-item.tsx`
- `web/default/src/features/home/api.ts`
- `web/default/src/features/home/types.ts`
- `web/default/src/features/home/components/quick-exchange-dialog.tsx`
- `web/default/src/features/home/components/sections/hero.tsx`
- `web/classic/src/pages/Home/index.jsx`
- `web/default/src/features/pricing/index.tsx`
- `web/default/src/features/usage-logs/components/common-logs-filter-bar.tsx`
- `web/classic/src/components/layout/headerbar/Navigation.jsx`
- `web/classic/src/components/table/usage-logs/UsageLogsActions.jsx`
- `web/default/src/i18n/locales/en.json`
- `web/default/src/i18n/locales/fr.json`
- `web/default/src/i18n/locales/ja.json`
- `web/default/src/i18n/locales/ru.json`
- `web/default/src/i18n/locales/vi.json`
- `web/default/src/i18n/locales/zh.json`

**Upstream merge notes:**

- Keep `/api/quick_exchange` local to the Go backend; do not restore the external `https://api-guid.silra.cn/get_api_key` dependency or a Flask sidecar flow.
- Preserve `middleware.CriticalRateLimit()` on the public quick-exchange route.
- Preserve idempotency for already-used redemption codes when `UsedUserId` matches the derived account.
- If upstream changes home, pricing, usage logs, or navigation contact UI, keep customer-service QR behavior in-place instead of link navigation.
- Keep home-page and header contact popovers click-controlled only, with a visible close button; do not restore hover/focus open or hover leave close behavior.
- Keep the home page “More Apps” support entry in both themes linked to `https://silra.apifox.cn/doc-8206391` in a new tab.
- Classic usage logs and header contact entries are included because the platform-wide customer-service behavior must not open QR links in a new browser tab.

**Validation:**

- `go test ./controller ./service ./router`
- `cd web/default && bun run i18n:sync`
- `cd web/default && bun run typecheck`
- `cd web/default && bun run build`
- `cd web/classic && npm run build`

### 2026-05-25 — China-Compliant Home Page Provider Display

**Behavior to preserve:** The default and classic home pages must not promote overseas model/provider names such as OpenAI/GPT, Claude, Gemini, Llama, xAI/Grok, Cohere, Suno, Midjourney, or Azure AI in the public landing content. Keep home page examples neutral or focused on domestic/self-hosted providers.

**Affected files:**

- `web/default/src/features/home/constants.ts`
- `web/default/src/features/home/components/sections/features.tsx`
- `web/default/src/features/home/components/sections/how-it-works.tsx`
- `web/default/src/features/home/components/hero-terminal-demo.tsx`
- `web/default/src/i18n/locales/en.json`
- `web/default/src/i18n/locales/fr.json`
- `web/default/src/i18n/locales/ja.json`
- `web/default/src/i18n/locales/ru.json`
- `web/default/src/i18n/locales/vi.json`
- `web/default/src/i18n/locales/zh.json`
- `web/classic/src/pages/Home/index.jsx`

**Upstream merge notes:**

- If upstream rewrites the landing page, re-check both `web/default` and `web/classic` public home pages for overseas model/provider promotion.
- Functional admin/channel configuration pages may still mention provider names when required for configuration; this entry covers public home page marketing/demo content.

**Validation:**

- `rg -n "Claude|Gemini|Llama|OpenAI|GPT|Grok|Cohere|Suno|Midjourney|AzureAI|XAI" web/default/src/features/home web/classic/src/pages/Home`
- `cd web/default && bun run i18n:sync`
- `cd web/default && bun run build`
- `cd web/classic && npm run build`

### 2026-05-25 — Default Theme Header Contact And 404 Redirect

**Behavior to preserve:** The default frontend theme header navigation must include a customer-service contact entry. The entry opens the WeChat support QR code, reminds users to include the username shown in the upper-right corner when consulting support, and closes immediately when the pointer leaves the contact trigger.

QR code URL:

`https://chatgpt-1305971836.cos.ap-nanjing.myqcloud.com/image.png`

The default theme 404 page must show an auto-redirect notice with a visible countdown and redirect to `/` after 5 seconds.

**Affected files:**

- `web/default/src/hooks/use-top-nav-links.ts`
- `web/default/src/components/layout/constants.ts`
- `web/default/src/components/layout/types.ts`
- `web/default/src/components/layout/components/nav-link-item.tsx`
- `web/default/src/components/layout/components/top-nav.tsx`
- `web/default/src/components/layout/components/public-header.tsx`
- `web/default/src/components/layout/components/public-navigation.tsx`
- `web/default/src/features/errors/not-found-error.tsx`
- `web/default/src/features/system-settings/maintenance/config.ts`
- `web/default/src/features/system-settings/maintenance/header-navigation-section.tsx`
- `web/default/src/i18n/locales/en.json`
- `web/default/src/i18n/locales/fr.json`
- `web/default/src/i18n/locales/ja.json`
- `web/default/src/i18n/locales/ru.json`
- `web/default/src/i18n/locales/vi.json`
- `web/default/src/i18n/locales/zh.json`

**Upstream merge notes:**

- Keep `contact: true` in the default header navigation configuration so existing deployments that lack this key still show the contact entry.
- Preserve QR hover behavior on desktop and click-through access on mobile.
- Do not reintroduce delayed hover-close behavior that can make the QR popover flicker after the pointer leaves the contact entry.
- Keep the 404 redirect delay at 5 seconds unless product requirements change.

**Validation:**

- `cd web/default && bun run i18n:sync`
- `cd web/default && bun run build`

### 2026-05-21 — Usage Logs Retention Notice

**Behavior to preserve:** Usage logs pages must show a dismissible yellow notice below the quota/RPM/TPM summary and above search filters:

`仅展示最近1-2周的使用记录，请自行做好全量日志留存，如有其他问题请咨询微信客服。`

The `微信客服` text must show the WeChat support QR code on hover/click using:

`https://chatgpt-1305971836.cos.ap-nanjing.myqcloud.com/image.png`

The notice must include a close control so users can hide it locally in both frontend themes.

**Affected files:**

- `web/default/src/features/usage-logs/components/common-logs-filter-bar.tsx`
- `web/default/src/i18n/locales/en.json`
- `web/default/src/i18n/locales/fr.json`
- `web/default/src/i18n/locales/ja.json`
- `web/default/src/i18n/locales/ru.json`
- `web/default/src/i18n/locales/vi.json`
- `web/default/src/i18n/locales/zh.json`
- `web/classic/src/components/table/usage-logs/UsageLogsActions.jsx`
- `web/classic/src/i18n/locales/en.json`
- `web/classic/src/i18n/locales/fr.json`
- `web/classic/src/i18n/locales/ja.json`
- `web/classic/src/i18n/locales/ru.json`
- `web/classic/src/i18n/locales/vi.json`
- `web/classic/src/i18n/locales/zh-CN.json`
- `web/classic/src/i18n/locales/zh-TW.json`
- `web/classic/src/i18n/locales/zh.json`

**Upstream merge notes:**

- Keep the notice in both frontend themes unless one theme is removed from the product.
- In `web/default`, the notice belongs in the common usage logs filter/header area.
- In `web/classic`, the notice belongs in the usage logs stats/header area rendered above filters.
- Preserve the wording `仅展示`, not `仅统计和展示`.
- Preserve the close control when upstream changes the usage logs header/filter layout.

**Validation:**

- `cd web/default && node scripts/sync-i18n.mjs`
- `cd web/classic && npm run build`

### 2026-05-19 — Model Square Support Notice And QR Contact

**Behavior to preserve:** The model square/pricing page must show a dismissible yellow support notice telling users to contact WeChat support for additional model support. The notice must expose:

- WeChat ID: `deepseek998877`
- QR code URL: `https://chatgpt-1305971836.cos.ap-nanjing.myqcloud.com/image.png`
- Warning that third-party platform sales support does not handle model-support requests.
- A close control so users can hide the notice locally in both frontend themes.

**Affected files:**

- `web/default/src/features/pricing/index.tsx`
- `web/default/src/i18n/locales/en.json`
- `web/default/src/i18n/locales/fr.json`
- `web/default/src/i18n/locales/ja.json`
- `web/default/src/i18n/locales/ru.json`
- `web/default/src/i18n/locales/vi.json`
- `web/default/src/i18n/locales/zh.json`
- `web/classic/src/components/table/model-pricing/layout/content/PricingContent.jsx`
- `web/classic/src/i18n/locales/en.json`
- `web/classic/src/i18n/locales/fr.json`
- `web/classic/src/i18n/locales/ja.json`
- `web/classic/src/i18n/locales/ru.json`
- `web/classic/src/i18n/locales/vi.json`
- `web/classic/src/i18n/locales/zh-CN.json`
- `web/classic/src/i18n/locales/zh-TW.json`
- `web/classic/src/i18n/locales/zh.json`

**Upstream merge notes:**

- Keep the notice in both `web/default` and `web/classic` model-pricing pages.
- Use hover on desktop and click-compatible behavior on mobile where the theme component supports it.
- Preserve the close control when upstream changes the model square/pricing layout.
- Do not reintroduce the reverted one-line notice from commit `708c2d4b2`; preserve the richer notice from `63870b4ed`.

**Validation:**

- `cd web/default && node scripts/sync-i18n.mjs`
- `cd web/classic && npm run build`

### 2026-04-23 — Header Customer Service QR Entry

**Behavior to preserve:** Classic header navigation has a customer-service/contact entry that opens the WeChat support QR code and closes immediately when the pointer leaves the contact trigger. The popover text should remind users to include the username shown in the upper-right corner when consulting support.

QR code URL:

`https://chatgpt-1305971836.cos.ap-nanjing.myqcloud.com/image.png`

**Affected files:**

- `web/classic/src/components/layout/headerbar/Navigation.jsx`
- `web/classic/src/components/layout/headerbar/index.jsx`

**Upstream merge notes:**

- Preserve the final hover-trigger popover behavior from `e95261ec7`; do not restore the custom controlled-popover state that made the QR hard to close.
- Clicks on the classic contact entry should toggle the popover instead of leaving it stuck open.
- Keep passing `t` from the header bar into `Navigation`; this also prevents the classic homepage/header blank-screen regression fixed by `4b37a4cb5`.

**Validation:**

- `cd web/classic && npm run build`

### 2026-05-15 — Model Square Visibility And Ratio Policy

**Behavior to preserve:** Model square should not expose model list multiplier details that the local product chooses to hide. Keep any local switches/configuration that hide model-list ratios or recharge-ratio style details.

**Historical context:**

- `46976f241` / `dd4dd6c9f` introduced customer-service entry and switches for hiding model-list ratios.
- `9bc1d648` and `708c2d4b2` were reverted by `9312275d9` and `dc87e442a`; do not preserve the reverted behavior that hid overseas vendors/models or the temporary one-line support notice in `web/default`.
- `14b5e227f` added a classic support notice and model/vendor hiding; preserve only the final intended behavior that still exists after later reverts/refactors.

**Affected areas to inspect during merges:**

- `web/default/src/features/pricing/**`
- `web/classic/src/components/table/model-pricing/**`
- `web/classic/src/hooks/model-pricing/**`
- Any status/config flag that controls model-list ratio visibility.

**Upstream merge notes:**

- When upstream changes model-pricing tables, cards, or group-ratio badges, verify whether local ratio hiding still applies.
- Prefer configuration-driven hiding over hard-coded vendor/model filtering.
- Do not drop the model-support QR notice while resolving pricing-page conflicts.

**Validation:**

- Manually inspect model square in both themes.
- `cd web/default && node scripts/sync-i18n.mjs`
- `cd web/classic && npm run build`

### 2026-04-09 / 2026-04-15 — Ali DashScope DeepSeek Stream Error Retry

**Behavior to preserve:** Ali/DashScope DeepSeek streaming responses can return OpenAI-style error payloads inside an HTTP 200 SSE stream. The Ali adaptor must inspect the beginning of eligible streams and convert such embedded errors into `http.StatusServiceUnavailable` via `types.WithOpenAIError(...)` so normal retry logic can run.

**Affected files:**

- `relay/channel/ali/adaptor.go`

**Upstream merge notes:**

- Keep `isAliDeepseekStreamInspectionRetryCandidate`.
- Keep SSE inspection in `buildAliDeepseekStreamInspectionRetryErrorFromSSE`.
- Restore `resp.Body` after inspection with the captured bytes plus unread reader content.
- Avoid reading the whole stream; only inspect the initial chunks to prevent streaming packet backlog.
- Retry should trigger not only for `data_inspection_failed`, but for embedded OpenAI-style errors with non-empty type/message/code.
- Continue using `common.UnmarshalJsonStr` rather than direct JSON unmarshal.

**Validation:**

- Add or run targeted Ali adaptor tests when available.
- Manual verification: an Ali DeepSeek stream that returns embedded `error` in SSE should fail with a retryable 503, not stream the error to the client as a normal 200.

### 2026-04-09 / 2026-04-10 — Usage Logs Hide Cache Token Details

**Behavior to preserve:** Usage logs should hide separate cache-token detail rows/toggles in the input token column, while still adding cache read/write/create token counts into the displayed input-token total where required.

**Affected files:**

- `web/classic/src/components/table/usage-logs/UsageLogsColumnDefs.jsx`
- Related default-theme usage log column files if upstream moves this behavior into `web/default`.

**Upstream merge notes:**

- Preserve helper logic such as `toTokenNumber`, `getPromptCacheTotal`, and `getLogOther` usage.
- Do not reintroduce the old cache-token visibility toggle as a visible UI control unless explicitly requested.
- Token copy actions must keep working after hiding the toggle.

**Validation:**

- Manually inspect usage logs with Anthropic/cache-token records.
- Verify input token total includes cached tokens where intended.

### 2026-04-09 — API Key List Returns Raw Keys

**Behavior to preserve:** The API key list endpoint returns raw token keys instead of masked keys.

**Affected files:**

- `controller/token.go`
- `controller/token_test.go`

**Upstream merge notes:**

- Preserve `GetAllTokens` returning `tokens`, not `buildMaskedTokenResponses(tokens)`.
- Keep tests aligned with raw-key behavior.
- This is intentionally different from upstream masking behavior; consider the security implications before changing it.

**Validation:**

- `go test ./controller -run TestGetAllTokensReturnsRawKeyInResponse`

### 2026-04-30 — Default Theme API Key Group Defaults

**Behavior to preserve:** In the default theme, API key creation must respect the system `default_use_auto_group` setting. When it is disabled, the default group is the user group (`''`) instead of `auto`; when enabled, the form defaults to `auto` and cross-group retry.

**Affected files:**

- `web/default/src/features/keys/components/api-key-group-combobox.tsx`
- `web/default/src/features/keys/components/api-keys-mutate-drawer.tsx`
- `web/default/src/features/keys/constants.ts`
- `web/default/src/features/keys/lib/api-key-form.ts`
- `web/default/src/features/keys/lib/index.ts`

**Upstream merge notes:**

- Preserve `getApiKeyFormDefaultValues(defaultUseAutoGroup)`.
- Keep combobox popover wheel/touch/pointer event containment so scrolling inside the dropdown does not leak to parent containers.

**Validation:**

- In default theme, create API keys with `default_use_auto_group` both enabled and disabled.

### 2026-05-19 — Login Redirects To Chat

**Behavior to preserve:** Successful classic-theme login flows redirect to `/console/chat/0` rather than the console dashboard, root, or token page.

**Affected files:**

- `web/classic/src/components/auth/LoginForm.jsx`
- `web/classic/src/components/auth/OAuth2Callback.jsx`

**Upstream merge notes:**

- Preserve redirect target for username/password, WeChat, LinuxDo, passkey, 2FA, and OAuth callback login paths.
- If upstream introduces a shared post-login redirect helper, move this behavior there instead of losing it.

**Validation:**

- Test each enabled login path that is practical in the local environment.

### 2026-05-19 — Email Binding Reminder On Top-Up Page

**Behavior to preserve:** Classic top-up page shows an email-binding reminder modal for users whose displayed balance exceeds `10` and who have not bound an email. The modal routes users to `/console/personal` when they choose to bind.

**Affected files:**

- `web/classic/src/components/topup/index.jsx`
- `web/classic/src/i18n/locales/en.json`
- `web/classic/src/i18n/locales/fr.json`
- `web/classic/src/i18n/locales/ja.json`
- `web/classic/src/i18n/locales/ru.json`
- `web/classic/src/i18n/locales/vi.json`
- `web/classic/src/i18n/locales/zh-CN.json`
- `web/classic/src/i18n/locales/zh-TW.json`
- `web/classic/src/i18n/locales/zh.json`

**Upstream merge notes:**

- Preserve `EMAIL_BIND_REMINDER_THRESHOLD = 10`.
- Use `quotaToDisplayAmount` when comparing balance threshold.
- Show the reminder after refreshing current user data, not from stale local state.

**Validation:**

- Test top-up page with: balance <= 10, balance > 10 with email, and balance > 10 without email.

### 2026-04-29 — Preserve Explicit Empty Reasoning Fields

**Behavior to preserve:** `dto.Message.ReasoningContent` and `dto.Message.Reasoning` must remain `*string` with `omitempty` so explicit empty strings from client JSON are preserved when re-marshaled upstream, while absent fields remain omitted.

**Affected files:**

- `dto/openai_request.go`
- `dto/message_reasoning_test.go`
- `relay/channel/claude/relay-claude.go`
- `relay/channel/gemini/relay-gemini.go`
- `relay/channel/ollama/stream.go`
- `relay/channel/openai/relay-openai.go`

**Upstream merge notes:**

- Preserve `Message.GetReasoningContent()`.
- Do not revert these fields to plain `string`; this is required by AGENTS Rule 6.
- Update all read/write sites when upstream touches reasoning fields.

**Validation:**

- `go test ./dto -run Reasoning`

### 2026-04-09 / 2026-04-13 — Amount-First Quota Adjustment And Admin Audit Logs

**Behavior to preserve:** Admin user quota editing uses a dedicated atomic adjustment flow instead of directly editing quota in the user edit form. The UI prioritizes monetary amount input and keeps raw quota input collapsed. Admin management logs must include the admin username for add/subtract/override quota changes.

**Affected files:**

- `controller/user.go`
- `model/user.go`
- `service/funding_source.go`
- `service/quota.go`
- `service/task_billing.go`
- `web/src/components/table/users/modals/EditUserModal.jsx`
- `web/src/components/table/redemptions/modals/EditRedemptionModal.jsx`
- `web/src/components/table/tokens/modals/EditTokenModal.jsx`
- `web/src/helpers/quota.js`
- Backend and frontend i18n locale files touched by the quota UI.

**Upstream merge notes:**

- Preserve `ManageUser` action `add_quota` with modes `add`, `subtract`, and `override`.
- Preserve direct DB write option for `DecreaseUserQuota(id, quota, db)` so admin adjustments bypass delayed batch update when required.
- Keep user edit form quota fields read-only; changes should go through the adjustment modal.
- Keep negative quota-safe conversions in `quotaToDisplayAmount` and `displayAmountToQuota`.
- Preserve log format that includes `管理员(<admin username>)...`.

**Validation:**

- Admin add/subtract/override quota from UI.
- Confirm resulting user quota and management log.
- Run relevant Go tests for user quota paths if available.

### 2026-04-15 — Multi-Key Management Index Display

**Behavior to preserve:** Multi-key management modal displays key indexes starting from `#1`, not `#0`.

**Affected files:**

- `web/src/components/table/channels/modals/MultiKeyManageModal.jsx`

**Upstream merge notes:**

- Preserve rendering as `#${Number(text) + 1}` or equivalent if upstream refactors the channel multi-key UI.

**Validation:**

- Open a channel multi-key management modal and confirm the first row displays `#1`.

### 2026-04-30 — Tiered Billing Frontend Display Fixes

**Behavior to preserve:** Tiered/dynamic billing display must decode Base64 expressions with UTF-8 support, normalize tier labels before matching, and avoid guessing a tier when the log `matched_tier` cannot be matched.

**Affected files:**

- `web/default/src/features/pricing/components/dynamic-pricing-breakdown.tsx`
- `web/default/src/features/pricing/lib/billing-expr.ts`
- `web/default/src/features/usage-logs/components/columns/common-logs-columns.tsx`
- `web/default/src/features/usage-logs/components/dialogs/details-dialog.tsx`
- `web/default/src/features/usage-logs/lib/format.ts`
- `web/classic/src/helpers/render.jsx`
- `web/classic/src/i18n/locales/*.json`

**Upstream merge notes:**

- When touching tiered/dynamic billing, read `pkg/billingexpr/expr.md` first.
- Preserve `normalizeTierLabel` behavior for spaces, case, and `<`/`<=`/`≤`/full-width variants.
- If no matched tier can be resolved, show an explicit no-match state instead of falling back to the first tier.

**Validation:**

- Use a tiered billing expression with non-ASCII labels.
- Verify usage-log details highlight only the actually matched tier.

### 2026-05-29 — Hide Wallet Referral Entry Cards

**Behavior to preserve:** The wallet/top-up pages must not show the referral/invitation reward entry cards to end users. Keep existing transfer dialog and related backend flows intact; only the visible wallet-page entry points are hidden.

**Affected files:**

- `web/default/src/features/wallet/index.tsx`
- `web/classic/src/components/topup/index.jsx`

**Upstream merge notes:**

- In the default theme, keep `AffiliateRewardsCard` out of the wallet page render tree.
- In the classic theme, keep `InvitationCard` out of the top-up page render tree.
- Do not remove the affiliate transfer dialog or backend API handlers unless the product decision changes.

**Validation:**

- Open the wallet/top-up page in both themes and confirm referral/invitation cards are absent.
- Confirm normal recharge, redemption, subscription and billing-history entry points still render.
