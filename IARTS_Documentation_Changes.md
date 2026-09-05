# What changed in the documentation

Corrections applied to **IARTS Full Documentation (code-aligned).docx** so every claim matches the code in the repository. 136 edits across Chapters 2, 3 and 4. Formatting, headings, figures, tables and all 17 images are unchanged; the original file was not modified.

The rule I followed: **remove the claim, keep the capability.** Nothing was deleted that the system actually does, and nothing now describes something it doesn't. Where a gap is real, it's stated once as future work rather than hidden.

---

## Security claims — the ones that mattered most

| Section | Was | Now |
|---|---|---|
| §2.5.7, §3.8, §4.8 | "role-based route access… on every API request"; "each endpoint checks the caller's role" | Role checks stated where they actually exist — claim stage transitions gated to the owning officer role, payment endpoints restricted to the owning supplier or a bank account. Extending role matchers across the remaining CRUD endpoints noted as future work. |
| §2.5.8, §3.8, §4.8, §3.7 | Tokens "signed at issuance"; banks reject "signature verification" failures | Token validated by Active status, supplier ownership, expiry and absence of an outstanding submission. Cryptographic signing named as future work. |
| §2.4, §2.5.1, §2.5.7, §3.3.6, §4.8 | Kiosk "authenticates with a fixed terminal key" | Scanner endpoints described as deliberately public, with the reason (no human logs in, a queue can't wait for a login) and the bounded capability (submit a card identifier — cannot issue tokens, advance claims or move money). Terminal key named as future work. |
| §3.8, §4.8, §2.6 | "immutable audit log" of every scan, report, token and transaction | Append-only **claim approval log** (stage changes, freezes, rejections, with actor), plus bank transactions linked to the token they settled. |
| §3.5.6, §3.8 | "auto-terminates idle sessions"; logins/logouts logged | Stateless signed JWT with a fixed 24-hour expiry; no server-side session retained. |

## Architecture claims

- **WebSocket → polling.** Removed from all seven places (§2.4, §2.7 tools table, §3.2.2, §3.11, §4.5, §4.7 twice). Now described as a four-second TanStack Query refetch of the scanner feed, five seconds elsewhere. The tools-table row is now "TanStack Query polling".
- **Redis.** Six places now say it is provisioned in the stack but not read or written by the current build, and that duplicate checks resolve against PostgreSQL on every tap. The 3-second cooldown is correctly attributed to the kiosk client.
- **Flyway** added where the schema is described — it's real, it's good practice, and it wasn't mentioned.

## Data model

- **§4.4 SQL replaced with the real DDL** from `V1__init.sql` (plus the V3/V4/V6 columns): actual column names, `password_hash`, `rejection_reason`, `reason`, and the real non-unique composite index. The invented `schools` table reference is gone.
- **The `UNIQUE` constraint claim is gone**, along with the §4.10 story about it closing a race condition. §4.4 now explains why `meal_validations` stores `card_number`/`student_name` as a point-in-time snapshot rather than foreign keys, and states plainly that duplicate prevention is currently in application logic.
- **§3.10.2 logical schema tables rewritten cell by cell** to match the real columns — `meal_validations` (card_number, student_name, scan_time, served/is_duplicate/is_flagged), `cards` (is_active, issued_at), `daily_reports` (meals_served, four-value status), `government_tokens` (token_code, value, five-value status), `bank_transactions` (processed_at). `reimbursement_claims` with its `report_ids UUID[]` is now **`claims`**, with `claim_value`, `stage` and the frozen/rejected flags.

## Workflow and state models

- **Token lifecycle (§2.5.8) rewritten as two co-operating state machines** — `GovernmentToken` (Pending, Active, Redeemed, Expired, Rejected) and `PaymentSession` (Pending, Processing, Completed, Failed) — and explains that holding submission state on the session is what prevents double redemption. This replaces the seven-state single machine that didn't exist.
- **The four-stage report pipeline is gone.** Daily reports now correctly carry Draft / Submitted / Approved / Flagged.
- **The ten-stage claims workflow is now documented** — §2.5.3 describes Received → Intake → Regional → Financial → Audit → Budget → Token Generated → Supplier Redemption → Bank Settlement → Closed, the per-stage role gating, the Audit & Risk freeze/reject powers, and the approval log. This is the strongest thing you built and it wasn't in the document at all. It also appears in the §2.6 feature list and the §4.5 Government Module.
- **Three government officer roles** (Regional, Financial, Audit & Risk) now appear in §2.5.3, resolving the five-actors-versus-six-roles mismatch.
- **Duplicate rule corrected** everywhere from "within the same meal session" to "already served at that dining hall on the same day" (§3.5.1, §3.8, use case table).
- **The Scheduler (Cron Job) actor row was removed** from the §3.6.4 table — there is no scheduled job in the code.
- Use-case table entries corrected: "Run Fraud Detection Engine" → "Flag Anomalous Scan", "Write Audit Log Entry" → "Write Claim Approval Log Entry", and the token/validation descriptions.

## Testing (§4.9)

- "automated test case" → "manual test case exercised through Postman or the portal UI"; "Run the full backend test suite" → walk the token chain end to end.
- **§4.9.3 is now titled "Results (Manual Test Run)"** — the eleven rows stand, but they're no longer presented as automated coverage.
- Row 11 changed from "Role-restricted endpoint access / Request denied for wrong role" to **"Claim advanced by the wrong officer role / Request denied (403 Forbidden)"** — which is a test that genuinely passes against `ClaimController`.

## Challenges (§4.10)

All five resolutions were rewritten to describe what the code actually does:

1. **QR scanning** — BarcodeDetector availability and the fallback message, not contrast normalisation.
2. **Role permissions** — concentrating enforcement at the claim and payment decision points, not a centralised annotation.
3. **Report/scan sync** — reports compiled on demand from `meal_validations`, not a fixed cutoff with flagged stragglers.
4. **Duplicate scans** — now states honestly that check-and-insert are separate statements, that the client cooldown and indexed lookup narrow the window, and that a unique index would close it.
5. **Token lifecycle** — the real design story: separating token status from session status, which is what lets a rejected submission leave the token resubmittable.

## Code snippets (§4.5)

Both replaced with code that is actually in the repository — the real `SecurityConfig` filter chain (including the public matchers, so the document is consistent with itself) and the real same-day duplicate check from `ScannerController`, showing that a rejected scan is still persisted.

---

## Two things to know

**1. You chose the attached file, which is the older draft.** Its §3.10.2 still had the pre-V2 `reimbursement_claims` table with `report_ids UUID[]`, no `payment_sessions`, and no `aza_*` columns. The copy in your SHS DINING HALL folder (2 Aug) is newer. I corrected the attached one as you asked and brought its schema section up to the real code, but if the folder copy has other newer text, those improvements aren't in this file.

**2. Chapter Five doesn't exist yet.** The document ends at §4.11, though §1.12 promises five chapters. I removed my forward references to it, so nothing points at a missing chapter — but the gap is still there, and a panel reading the structure section will notice. The future-work items now scattered through Chapters 2–4 (unique index, token signing, terminal key, uniform role matchers, offline scanning) would populate a Chapter Five recommendations section quickly if you want one.

**Still true and worth saying out loud:** JWT auth, BCrypt hashing, the role-gated claims workflow with its approval log, the guarded redemption path, persisted rejected scans, and Flyway-versioned migrations with `ddl-auto: validate`. The document now claims those and only those.
