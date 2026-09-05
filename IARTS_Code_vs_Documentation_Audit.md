# IARTS — Code vs Documentation Audit

Every claim in *IARTS Full Documentation.docx* checked against the actual code in the repository.
Audited: `backend/src/main/java/com/iarts/**`, `backend/src/main/resources/**` (including all six Flyway migrations), `backend/pom.xml`, `src/**` (React frontend).

**Headline:** the documentation describes a materially more secure and more complete system than the one in the repository. Nine claims are not implemented at all. Five of those are security claims, and one — the test results table — asserts evidence that does not exist.

**Read this first if you're short on time:** items 1, 2, 3, 4 and 5 are the ones that can end a defence badly. Items 1–3 are each fixable in under an hour of code.

---

## Summary

| # | Documentation claim | Reality in code | Severity |
|---|---|---|---|
| 1 | RBAC enforced on every API request | Only `authenticated()`; role checks in 2 of 14 controllers | 🔴 Critical |
| 2 | Tokens signed, lifecycle state machine, can't be double-spent | Plain CRUD; client sets code, value, supplier and status; DELETE exposed | 🔴 Critical |
| 3 | DB `UNIQUE` constraint prevents duplicate scans; closed a race condition | No unique constraint — plain index only; app-logic check only | 🔴 Critical |
| 4 | Kiosk authenticates with a terminal key | `/scanner/**` is `permitAll` — no key, no auth | 🔴 Critical |
| 5 | 11 test cases, all Pass | Only test in repo is `contextLoads()` | 🔴 Critical |
| 6 | WebSocket pushes live scan events | No WebSocket anywhere; 4–5s polling | 🟠 High |
| 7 | Redis enforces scan cooldown / terminal key validation | Redis never called; cooldown is client-side only | 🟠 High |
| 8 | Immutable audit log of every scan, token and transaction | Only `claim_approval_logs`; tokens are deletable | 🟠 High |
| 9 | Cash release traceable back to underlying scans | FK chain broken at three joins | 🟠 High |
| 10 | Client-side role guards on routes | `PrivateRoute` checks login only, not role | 🟠 High |
| 11 | 7 token states | 5 in `TokenStatus` | 🟡 Medium |
| 12 | 4-stage report pipeline (Generated → … → Claim Eligible) | `DRAFT, SUBMITTED, APPROVED, FLAGGED` | 🟡 Medium |
| 13 | — (not documented) | 10-stage `ClaimStage` workflow exists in code | 🟡 Medium |
| 14 | Five actors | Six roles in `UserRole` | 🟡 Medium |
| 15 | §4.4 schema listing | Does not match `V1__init.sql`; references a `schools` table that doesn't exist | 🟡 Medium |
| 16 | Duplicate blocked per meal session | Blocked per day, per dining hall, served-scans only | 🟡 Medium |
| 17 | — (not documented) | Aza payment integration in config, schema and security rules | 🟡 Medium |
| 18 | Scanner does contrast normalisation + retry loop | No such code | 🟡 Medium |
| 19 | Scheduler (cron) actor generates end-of-day reports | No `@Scheduled` anywhere | 🟡 Medium |
| 20 | Idle sessions auto-terminate; logins/logouts logged | Fixed 24h JWT, stateless, no logging | 🟡 Medium |
| 21 | — (not documented) | `/auth/dev-login` mints any role with no credentials, and `dev` is the default profile | 🔴 Critical (demo risk) |

---

# 🔴 Critical

## 1. Role-based access control is not enforced on most endpoints

**Doc says** — §2.5.7: *"enforces role-based route access both client-side, via router guards, and server-side, via a Spring Security filter chain that validates the JWT and role claim on every API request."* §3.8: *"each request is checked against the caller's role, so a School Admin cannot approve a claim and a Government Officer cannot edit attendance data."* §4.10 says the risk of inconsistent permissions was solved because *"a centralised role-check annotation was introduced so access rules are declared once per endpoint."*

**Code says** — `config/SecurityConfig.java`:

```java
.requestMatchers("/auth/**").permitAll()
.requestMatchers("/scanner/**").permitAll()
.requestMatchers("/webhooks/**").permitAll()
.anyRequest().authenticated()
```

That is the entire authorization policy. A repo-wide grep for `@PreAuthorize`, `hasRole`, `hasAuthority` and `@Secured` returns **zero matches**. The "centralised role-check annotation" does not exist.

Role checks exist in exactly two controllers, written by hand:
- `PaymentSessionController` — `requireBank(principal)` plus a supplier-ownership check
- `ClaimController` — a stage→role map gating claim advancement

Every other controller — `GovernmentTokenController`, `StudentController`, `CardController`, `DailyReportController`, `SupplierController`, `UserController`, `SupplyOrderController`, `ReorderLevelController`, `SupplyConsumptionController`, `BankTransactionController` — accepts **any authenticated user regardless of role**.

**What this means concretely:** a supplier's JWT can create students, deactivate cards, edit daily reports, and issue government tokens. The separation-of-duties argument that is the entire thesis of the project is not enforced by the code for most of the system.

**Fix (recommended — ~30 minutes):** add role matchers to `SecurityConfig` and it's largely done:

```java
.requestMatchers(HttpMethod.POST, "/tokens/**").hasRole("FINANCIAL_OFFICER")
.requestMatchers(HttpMethod.DELETE, "/tokens/**").denyAll()
.requestMatchers("/students/**", "/cards/**").hasRole("SCHOOL_ADMIN")
```
(requires authorities be granted as `ROLE_*` in `JwtAuthFilter` — check how `AuthenticatedPrincipal` builds them).

---

## 2. Government tokens are unsigned, client-supplied, and deletable

**Doc says** — §2.5.8: *"Owns the state machine governing a government token… Pending, Active, Submitted, Validated, Redeemed, Expired, Rejected. The module enforces that a token can never be spent twice and cannot be accepted after its expiry date."* §3.8: *"government tokens are signed at issuance; a bank rejects any token that fails signature verification."* §4.8: *"government tokens are checked for a valid signature, non-expiry, and non-redemption."*

**Code says** — `token/GovernmentTokenController.java` is unguarded CRUD:

```java
private void apply(GovernmentToken token, GovernmentTokenRequest req) {
    token.setTokenCode(req.tokenCode());          // client supplies the code
    token.setSupplierId(UUID.fromString(req.supplierId()));
    token.setValue(req.value());                  // client supplies the amount
    token.setStatus(req.status() != null ? req.status() : TokenStatus.PENDING);
}
```

There is **no signing anywhere in the codebase** — `JwtService` signs login JWTs, and that is the only signing that exists. There is no state machine: `PUT /tokens/{id}` sets whatever status the caller sends, with no transition guard and no expiry check. `DELETE /tokens/{id}` deletes the row outright.

There is also **no link to an approved claim**. `POST /tokens` does not read a claim, a report, or a scan. The governing rule — *no verified attendance, no token* — is not enforced at the point where tokens are created.

⚠️ **This is the single most dangerous discrepancy.** Your defence rests on "the government can only issue a token against verified attendance", and the code does not check that. Do not claim cryptographic signing in the room.

**Fix or re-document:**
- *Cheapest honest fix:* generate `tokenCode` server-side, require an approved `claimId` in `GovernmentTokenRequest`, reject the request if that claim is not at stage `BUDGET`/`TOKEN_GENERATED`, ignore any client-supplied `status`, and remove the `DELETE` mapping. Perhaps 40 lines.
- *If you can't:* rewrite §2.5.8, §3.8 and §4.8 to say tokens are validated by server-side code lookup, status and expiry — with the trust boundary being the server, not an independently verifiable signature — and move signing to future work.

**Note in your favour:** the redemption path *is* properly guarded. `PaymentSessionController` checks the token is `ACTIVE`, belongs to the calling supplier, and isn't already submitted; only a `BANK` principal can validate or release; and release flips the token to `REDEEMED`. Double-spend *at redemption* really is prevented. The gap is at issuance, not settlement — say it that precisely.

---

## 3. There is no `UNIQUE` constraint on `meal_validations`

**Doc says** — §4.4 shows `UNIQUE (card_id, dining_hall_id, DATE(scanned_at))` and states: *"The UNIQUE constraint on meal_validations is what enforces duplicate-scan prevention at the database level."* §4.10 tells the story: *"An early version relied on application logic alone, which occasionally allowed a race condition… Adding the database-level UNIQUE constraint shown in Section 4.4 closed this gap independently of the application code."*

**Code says** — `V1__init.sql` creates a plain, non-unique index:

```sql
CREATE INDEX idx_meal_validations_card_hall_time
  ON meal_validations(card_number, dining_hall_id, scan_time);
```

No migration V1–V6 adds a unique constraint. Duplicate prevention is application logic only, in `ScannerController`:

```java
boolean alreadyServedToday = mealValidationRepository
    .existsByCardNumberAndDiningHallIdAndServedTrueAndScanTimeAfter(...);
```

That is a check-then-insert with no transaction guard — **precisely the race condition the documentation says was fixed**. Two near-simultaneous taps of the same card can both pass the check and both insert as served.

⚠️ I flagged this story in your question bank as your strongest answer. **Do not tell it unless you add the constraint** — an examiner who opens `V1__init.sql` will find no constraint and you'll have narrated a fix that isn't there.

**Fix (recommended — 5 minutes, and it makes the story true):** add `V7__unique_meal_validation.sql`:

```sql
CREATE UNIQUE INDEX uq_meal_validation_card_hall_day
  ON meal_validations (card_number, dining_hall_id, (scan_time::date))
  WHERE served = true;
```

The partial `WHERE served = true` matters — rejected and duplicate rows are deliberately kept for the fraud feed, so a blanket constraint would break inserts.

---

## 4. The scanner has no terminal key — it is fully public

**Doc says** — §2.5.1: *"authenticating itself to the backend using a fixed terminal key rather than a user session."* §2.5.7: *"The Scanner Kiosk bypasses user authentication entirely, authenticating instead with a terminal-specific key."* §4.8 lists *"Terminal Key Authentication"* as an implemented security mechanism. §2.4 and §3.11 both say Redis validates terminal keys.

**Code says** — `SecurityConfig`: `.requestMatchers("/scanner/**").permitAll()`. `ScannerController` reads no key, no header, no secret. Its own comment: *"Public, unauthenticated kiosk endpoint… the physical card tap is the only 'auth' a student needs."* `ScanRequest` carries only `qrCode` and `diningHallId`.

Two consequences worth knowing before someone else finds them:
- **`POST /scanner/scan` is open to the internet.** Anyone with a QR value can inject attendance records — the exact fraud the system exists to prevent, with no credential needed.
- **`GET /scanner/feed` is also public** and returns every scan with `student_name`. That's an unauthenticated PII leak.

**Fix (~15 minutes):** add `iarts.scanner.terminal-key` to `application.yml`, require an `X-Terminal-Key` header in `ScannerController`, and move `/scanner/feed` behind `authenticated()` — the admin portal is logged in anyway, so nothing breaks. That converts the documented claim into a true one and closes the open write endpoint.

---

## 5. The test results table describes tests that do not exist

**Doc says** — §4.9.3 lists 11 test cases, all "Pass". §4.9.2 describes tracing *"each functional requirement from Chapter Three to at least one automated test case"* and running *"the full backend test suite against the token chain."*

**Code says** — the entire test tree is one file:

```java
@SpringBootTest
class BackendApplicationTests {
    @Test void contextLoads() {}
}
```

No unit tests, no integration tests, no test suite for the token chain. There is no frontend test setup either.

Row 11 of that table — *"Role-restricted endpoint access → Request denied for wrong role → Pass"* — is not just untested, it is **false in the current code** (see item 1).

⚠️ This is the most academically serious item here, because it presents evidence rather than a design intent. If an examiner asks to see the test suite, you need an answer ready.

**Fix:** either write ~11 `@SpringBootTest` + `MockMvc` cases (a focused day's work, and it makes the table true), or rewrite §4.9 to describe **manual** verification via Postman and portal walkthroughs, and relabel the table "Manual Test Results". The second option is honest and costs an hour. Do one of them.

---

## 21. `/auth/dev-login` issues any role without credentials — and `dev` is the default profile

**Code says** — `DevAuthController` is `@Profile("dev")` and mints a valid JWT for any requested role with no password:

```java
@PostMapping("/dev-login")
public ApiResponse<LoginResponse> devLogin(@RequestParam UserRole role) { ... }
```

`application.yml` sets `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:dev}` — **`dev` is the fallback**, so unless the environment variable is set, this endpoint is live. `/auth/**` is `permitAll`, so `POST /auth/dev-login?role=bank` returns a bank token to anyone.

The class comment says *"remove once QR login ships (Phase 2)"* — it hasn't been removed. `DemoUserSeeder` (also dev-profile) seeds six accounts sharing the password `Demo@1234`.

Not a doc discrepancy, but it undermines every security claim in Chapter 4 if anyone runs the app as-is, and it's the kind of thing a curious examiner tries. Set `SPRING_PROFILES_ACTIVE=prod` for any deployed instance, and consider deleting `DevAuthController` outright before you submit.

---

# 🟠 High

## 6. No WebSocket — the live feed polls

**Doc says** — §2.4, §2.7, §3.2.2, §3.11, §4.5, §4.7 and Figure 4.3 all describe a WebSocket channel pushing scan events. §4.7: *"the backend also pushes an update over a WebSocket channel that the School Admin Dashboard subscribes to."*

**Code says** — `pom.xml` has no `spring-boot-starter-websocket`. No `@EnableWebSocket`, no `SimpMessagingTemplate`, no STOMP config. The frontend polls:

```ts
// src/portals/school-admin/hooks/useLiveDiningFeed.ts
/** Polls the real scanner feed (no WebSocket in the backend yet) — single source shared…
refetchInterval: 4000,
```

Your own code comment states it. The same polling pattern (`refetchInterval: 5000`) appears in the bank, supplier and government portals.

**Fix:** re-document. Polling at 4s is a perfectly defensible choice for this scale and you can say so — *"we poll on a 4-second interval; WebSocket was designed for but not implemented, and would reduce server load at scale."* Six places in the doc need editing.

## 7. Redis is a dependency, not an implementation

**Doc says** — §2.4: *"Redis is used for caching and short-lived session/state data such as terminal key validation and rate-limiting scan bursts."* §3.11: *"Redis was used as a cache and cooldown store, specifically to enforce the duplicate-scan cooldown at the kiosk without hitting the primary database on every tap."*

**Code says** — `spring-boot-starter-data-redis` is in `pom.xml` and host/port are in `application.yml`, but **no Java file references Redis** — no `RedisTemplate`, no `@Cacheable`, no repository. Every tap hits Postgres directly.

The cooldown that does exist is client-side only, in `src/portals/scanner/ScannerPage.tsx`:

```ts
const SCAN_COOLDOWN_MS = 3000
const onCooldown = useRef(false)
```

A browser-side ref — trivially bypassed by anything that isn't your kiosk page. Note this contradicts §2.4's own claim that *"the frontend never has to trust client-side logic."*

**Fix:** re-document Redis as provisioned-but-unused, or delete it from the stack description. Don't claim it enforces anything.

## 8. The audit log is not universal and not immutable

**Doc says** — §3.8: *"every meal validation, report, token, and transaction is written to an immutable audit log."* §4.8 repeats it. §3.6.5 lists a *"Write Audit Log Entry"* system use case.

**Code says** — the only audit table is `claim_approval_logs` (V2), covering claim stage changes only. `ClaimApprovalLog`'s comment calls it *"Append-only audit trail — the actual accountability mechanism for the claims workflow"* — accurate, and correctly scoped. But there is no audit entry for a scan, a token issuance, a token status change, or a bank transaction, and no generic audit table.

"Immutable" is also overstated in the other direction: `DELETE /tokens/{id}` exists, and `ON DELETE RESTRICT` is never declared in any migration (Postgres defaults to `NO ACTION`, which is similar in effect, but the doc's §4.4 claim that this is deliberate isn't reflected in the SQL).

**Fix:** narrow the claim to what's true — *"claim workflow decisions are recorded in an append-only approval log; broader audit logging is future work"* — and delete the `DELETE` mapping on tokens.

## 9. The scan-to-payment chain is not linked by foreign keys

**Doc says** — repeatedly, that any payment can be traced back to the scans that justified it (§2.6, §3.8, §4.4).

**Code says** — the chain is joined by loose values, not references:

| Link | Reality |
|---|---|
| scan → card/student | ❌ `meal_validations.card_number` is a bare `VARCHAR(64)` with **no FK**; it stores `student_name` as text, not `student_id` |
| scan → daily report | ❌ no `report_id` on scans, no scan reference on `daily_reports` |
| report → claim | ❌ `claims` (V2) has **no** `report_id`. The dropped `reimbursement_claims` table *did* have `report_id REFERENCES daily_reports(id)` — V2 removed the only real link in the chain |
| claim → token | ❌ `government_tokens` has no `claim_id` |
| token → bank transaction | ✅ `bank_transactions.token_id REFERENCES government_tokens(id)` |

So four of five joins are inferential. You cannot, in SQL, walk from a released payment back to the specific scans behind it — you'd match on school name, dates and amounts.

**Fix:** re-document honestly, or add `claim_id` to `government_tokens` and `report_id` to `claims` — two nullable columns in a V7 migration would restore most of the chain and is genuinely worth doing.

## 10. Frontend route guards check login, not role

**Doc says** — §2.5.7: *"enforces role-based route access… client-side, via router guards."*

**Code says** — `router/AppRouter.tsx`: `function PrivateRoute({ children, loginPath })`. There is no `allowedRoles` parameter. Every portal wraps in the same guard with only a different `loginPath`, so any logged-in user can navigate to `/gov`, `/bank` or `/supplier` and the UI renders. Combined with item 1, the API will largely serve them.

**Fix (~10 minutes):** add a `role` prop to `PrivateRoute` and redirect to `roleHomeRoute(user.role)` on mismatch — `authStore` already exports that helper.

---

# 🟡 Medium — model and naming mismatches

## 11. Token states: 7 documented, 5 in code

Doc §2.5.8 lists Pending, Active, **Submitted**, **Validated**, Redeemed, Expired, Rejected. `TokenStatus.java` has `ACTIVE, REDEEMED, EXPIRED, REJECTED, PENDING`.

Submitted and Validated aren't missing conceptually — they live on a different entity, as `PaymentSessionStatus.PENDING/PROCESSING/COMPLETED/FAILED`. **This is a good design** (the submission is a separate object from the token), it's just not what the document describes. Re-document as two collaborating state machines and you turn a discrepancy into a design point.

## 12. Report pipeline is completely different

Doc: *"Generated, Operational Review, Compliance Review, and Claim Eligible"* (§2.5.2, §2.6, and the `daily_reports.status` enum in §3.10.2).
Code: `ReportStatus.java` → `DRAFT, SUBMITTED, APPROVED, FLAGGED`.

No overlap in any value. Anyone who opens the Meal Reports screen during your demo will see the wrong words.

## 13. The 10-stage claims workflow isn't documented at all

`ClaimStage.java`: `RECEIVED, INTAKE, REGIONAL, FINANCIAL, AUDIT, BUDGET, TOKEN_GENERATED, SUPPLIER_REDEMPTION, BANK_SETTLEMENT, CLOSED` — with `ClaimController` gating each advance to the right officer role, plus freeze/reject actions and `claim_approval_logs` recording every transition.

The frontend matches: `ClaimsWorkflow.tsx`, `RegionalDashboard.tsx`, `FinancialDashboard.tsx`, `AuditDashboard.tsx`.

**This is the best-implemented accountability mechanism in your codebase and the documentation never mentions it.** It is real multi-stage separation of duties with a real audit log. Adding a section on it is the highest-value edit available to you — it strengthens your central argument with something you actually built.

## 14. Five actors vs six roles

`UserRole.java`: `SCHOOL_ADMIN, REGIONAL_OFFICER, FINANCIAL_OFFICER, AUDIT_OFFICER, SUPPLIER, BANK`. The doc's five-actor model collapses three government officers into one "Government" actor. Defensible — say "five actor categories; government is subdivided into three officer roles because review, financial approval and audit are separate duties" — but say it deliberately, and ideally document it.

## 15. §4.4's schema listing doesn't match the migrations

The doc's `meal_validations` (`validation_id`, `card_id UUID REFERENCES cards`, `student_id`, `scanned_at`, `status`) shares almost nothing with `V1__init.sql` (`id`, `card_number VARCHAR`, `student_name`, `dining_hall_id`, `scan_time`, `served`, `is_duplicate`, `is_flagged`). Its `cards` table has an `expiry_date` and a `status` column; the real one has `is_active` and `issued_at`.

It also references `schools(school_id)` — **there is no `schools` table** in any migration. `school_id` is an unconstrained `UUID` everywhere.

§3.10.2's listing *is* accurate to the code. §4.4's is not. Simplest fix: replace §4.4's SQL with the real `V1__init.sql` excerpt.

## 16. Duplicate rule is per-day, not per meal session

Doc §3.5.1: *"Block duplicate attendance within the same meal session."*
Code: `existsByCardNumberAndDiningHallIdAndServedTrueAndScanTimeAfter(startOfDay)` — one served scan per card, per dining hall, **per calendar day**. A student who eats breakfast cannot be served lunch.

The concept exists elsewhere in your schema — `supply_consumptions.meal_session VARCHAR(32)` (V5) — it just never reached the scanner. If you add the V7 unique index from item 3, adding a `meal_session` column to `meal_validations` at the same time would make the code match the requirement.

## 17. The Aza payment integration is entirely undocumented

The word "aza" does not appear anywhere in the documentation. In the code it appears in:
- `application.yml` — `aza.base-url`, `aza.oauth.client-id`, `aza.oauth.client-secret`, `aza.webhook.tolerance-seconds`
- `V1__init.sql` — `users.aza_user_id`, `suppliers.aza_api_key`, `suppliers.aza_webhook_secret`, and the whole `payment_sessions` table (`aza_session_id`, `checkout_url`)
- `SecurityConfig` — `/webhooks/**` is `permitAll`
- `User.java` — *"Null for users only ever created via the Aza QR-login path"*

**Good news:** `PaymentSessionController`'s comment is explicit that this is simulated — *"no real money moves and no external Aza call is made… the process and status changes are real; the money is not."* That is consistent with your stated limitations, so this is a documentation gap, not a false claim. I flagged it as a possible contradiction in your question bank; the code clears you.

Two loose ends: `/webhooks/**` is permitted but **no webhook controller exists**, so that's an open rule pointing at nothing (harmless now, worth removing); and if asked, say plainly that `payment_sessions` is modelled on Aza's real payout lifecycle and simulated locally.

## 18. No scanner image pre-processing

Doc §4.10: *"resolved by adding client-side image pre-processing (contrast normalisation) before decoding, and a short retry loop before showing a failure state."*

`ScannerPage.tsx` contains no canvas, no `getContext`, no filter, no retry loop. It calls `BarcodeDetector` directly on the video element. The only related code is the 3s cooldown and a fallback message when `BarcodeDetector` is unavailable.

Don't tell this story in the defence — pick the duplicate-scan story instead (once item 3 is real).

## 19. No scheduler

Doc §3.6.4 lists *"Scheduler (Cron Job)"* as a system actor triggering *"end-of-day report generation and weekly batching."* No `@Scheduled`, no `@EnableScheduling`, no quartz. Reports are created through `DailyReportController` on request. The §4.10 story about a "fixed cutoff" for late-arriving scans has no corresponding code either.

## 20. Session handling

Doc §3.5.6: *"auto-terminates idle sessions."* §3.8: *"idle sessions are automatically terminated, and all logins/logouts are logged."*

`JwtService` issues a fixed 24-hour token; `SessionCreationPolicy.STATELESS` means there is no server-side session to expire, no idle timeout, no revocation, and no login/logout logging anywhere.

---

# What the documentation gets right

Worth knowing, so you defend the real system confidently:

- **JWT auth is real** — `JwtService` signs with HMAC-SHA via jjwt, `JwtAuthFilter` validates on every request, role and scoping claims (`schoolId`, `supplierId`) are embedded.
- **BCrypt is real** — `BCryptPasswordEncoder` bean, `password_hash` column added in V3.
- **The claims workflow is real and role-gated** — stage→role map, freeze/reject, append-only approval logs.
- **The redemption path is real and well-guarded** — supplier ownership check, token-must-be-ACTIVE, no double-submission, bank-only validate/release/reject, token flipped to `REDEEMED` on release, rejection reason recorded.
- **Rejected scans are persisted, not just displayed** — unknown cards and inactive students are written with `rejection_reason` and `is_flagged`, which is what makes the fraud feed meaningful.
- **Flyway migrations** — schema is versioned and reproducible, with `ddl-auto: validate` so entities and schema can't drift silently. That's better practice than most FYP projects.
- **BarcodeDetector with a graceful fallback message** when unsupported.

---

# Recommended order of work

**If you have a day:**

1. Add the `UNIQUE` index migration (item 3) — 5 min, makes your best defence story true
2. Add role matchers to `SecurityConfig` (item 1) — 30 min, restores the project's central claim
3. Remove `DELETE /tokens/{id}`, generate `tokenCode` server-side, ignore client-supplied status (item 2) — 30 min
4. Add the terminal key and close `/scanner/feed` (item 4) — 15 min
5. Add a `role` prop to `PrivateRoute` (item 10) — 10 min
6. Relabel §4.9.3 as manual test results (item 5) — 15 min

**Then, document edits (2–3 hours):**

7. Replace §4.4's SQL with the real `V1__init.sql`, and remove the `schools` reference (item 15)
8. Rewrite WebSocket → polling in all six places (item 6)
9. Rewrite Redis as provisioned-but-unused (item 7)
10. Correct the token state list and report pipeline to match the enums (items 11, 12)
11. Narrow the audit-log claim to the claims workflow (item 8)
12. **Add a section documenting the 10-stage claims workflow** (item 13) — the best return on effort in this whole list
13. Add a paragraph on the simulated Aza payout model (item 17)
14. Remove the pre-processing and scheduler claims (items 18, 19)
15. Correct the session-management claim (item 20)

**Before any demo:** run with `SPRING_PROFILES_ACTIVE=prod` or delete `DevAuthController` (item 21).
