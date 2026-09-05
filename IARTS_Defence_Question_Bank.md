# IARTS — Defence Question Bank

Anticipated panel questions with prepared answers, ordered by how likely they are to come up.
Built from your full project documentation (Chapters 1–4), so the answers reference your actual schema, modules, and test results.

**How to use this:** don't memorise answers word-for-word — memorise the *first sentence* of each. Panels judge you on whether you hesitate, not on eloquence. The first sentence buys you the time to construct the rest.

---

# TIER 1 — Near-certain. Prepare these cold.

### 1. "What exactly is new here? RFID cafeteria systems already exist."

> The differentiator is not the capture method — it's what the capture data is allowed to do. Every system we reviewed stops at the scan log. In an RFID cafeteria system the scan log is operational data; nobody downstream is required to consult it before money moves. In IARTS the scan data is the *only* thing that can produce a token, and the token is the *only* thing that can release cash. That link — scan to token to settlement, enforced server-side across four separate role boundaries — is the contribution. You could swap our QR scanner for RFID or biometrics tomorrow and the contribution would still stand, because it lives in the token chain, not the reader.

### 2. "What stops a school administrator from tapping cards for absent students?"

> Nothing in software alone stops physical card abuse, and I want to be straight about that. What the system changes is that it moves the fraud from invisible to detectable and expensive. Under the current paper system, inflating a number costs one pen stroke and leaves no evidence. Under IARTS you would need physical possession of specific cards, at the terminal, within the meal window, at a plausible tap rhythm — and every one of those taps is timestamped, attributed to a terminal, and visible to the government officer reviewing the report, not just to the school. The fraud engine flags duplicate and unusually-clustered scans before a report becomes claim-eligible.
>
> We're not claiming to have eliminated fraud. We're claiming to have removed the *costless* version of it and made the remaining version leave evidence.

**Delivery note:** this is the single most likely question in the room. The honest opening — "nothing in software alone stops that" — is what makes the rest credible. Do not try to claim the system is fraud-proof.

### 3. "Why QR codes and not biometrics? Biometrics would actually verify identity."

> Cost and national scale. Biometrics gives materially stronger identity assurance — we said so in our review. But per-dining-hall hardware cost and maintenance overhead is precisely the weakness that keeps biometric attendance from scaling across hundreds of Free SHS schools, and a system that can't be deployed nationally doesn't solve a national accountability problem. A QR dining card costs cents to print, can be reissued the same day if lost, and turns any camera-equipped tablet into a terminal.
>
> We treated identity assurance as an upgrade path rather than a prerequisite, because the token chain works with any attendance capture method. Adding a photo capture or fingerprint step at the kiosk is an enhancement to one module — it doesn't require redesigning anything downstream.

### 4. "Did you test with real data, in a real school?"

> No, and it's a stated limitation. Live feeding programme data is restricted by data-privacy policy and we had no lawful route to it, so we tested against simulated data patterned on realistic enrolment and meal-service volumes. The academic calendar also ruled out a long-term pilot.
>
> What that lets us claim is that the logic is correct and the access rules hold — our test suite covers the full token chain and every rejection path. What it does not let us claim is anything about real-world operational load or human behaviour in a live dining hall at 7am. That gap is exactly what a pilot would close, and it's the first item in our future work.

### 5. "How is your audit trail actually immutable? It's a PostgreSQL table — a DBA can just UPDATE it."

> That's a fair challenge, and "immutable" in our documentation means application-level immutability, not cryptographic immutability. Our audit entries are append-only through the application layer — no service exposes an update or delete path for them — and foreign keys throughout the schema use `ON DELETE RESTRICT`, so a student, card, or token cannot be removed while an attendance or transaction record still references it. That prevents the audit trail being broken through the application.
>
> It does not defend against a privileged database administrator with direct SQL access. Genuine tamper-evidence would need either hash-chaining each audit entry to its predecessor, or write-once storage outside the primary database. That's a real limitation of the current build and an honest piece of future work.

**Delivery note:** if you claim cryptographic immutability here and they push, you lose credibility for the rest of the session. Concede it cleanly — the `ON DELETE RESTRICT` detail proves you thought about it.

### 6. "Which of you built what?"

> [Agree this with Fahad in advance and give the same answer.] Be specific — "I built the Spring Boot token and bank modules and the database schema; Fahad built the React portals and the kiosk" is a good answer. "We both worked on everything" is a bad answer and invites the panel to test whether either of you can explain the code.

### 7. "Walk me through what happens from a single card tap to the supplier being paid."

> A student taps at the kiosk. The kiosk authenticates with its terminal key — not a user login — and posts the card identifier. The QR Verification Module looks up the card, confirms the student is actively enrolled, and checks whether that card has already been used in this meal session. It returns one of four outcomes: served, duplicate, invalid, or inactive, and the result shows on screen within about two seconds. A successful verification is persisted as a timestamped `meal_validations` record and pushed to the School Admin's live feed over WebSocket.
>
> At end of day, the Report Module aggregates those verifications into a Daily Report, runs the fraud-detection checks, and the report moves through four stages — Generated, Operational Review, Compliance Review, Claim Eligible. Only a claim-eligible report can back a reimbursement claim.
>
> A Government Officer reviews the claim against enrolment records. On approval, the Token Module generates a `government_tokens` record with a value, an issuing date, an expiry, and a status. The supplier sees it in their token inbox and submits it to a bank. The Bank Module checks the token is authentic, active, and unredeemed; on success it writes a `bank_transactions` record and releases cash. On failure it logs the rejection with a reason.

**Delivery note:** practise this one out loud until it runs in under 90 seconds. It's the question that proves you built the system, and panels often open with it.

---

# TIER 2 — Very likely, especially from a technical examiner.

### 8. "Your non-functional requirements say a scan must return in under two seconds. Did you measure that?"

> We specified it as a requirement and designed for it — that's why the duplicate-scan cooldown check goes to Redis rather than to PostgreSQL on every tap, so the hot path avoids a primary-database round trip. But our test results table records functional pass/fail outcomes, not latency measurements, so I can't give you a measured figure under load. Formal performance testing against that threshold, and load testing against the scalability requirement, are gaps in our validation rather than gaps in the design.

**Delivery note:** they will notice that your results table in 4.9.3 is eleven rows of "Pass" with no performance or load testing. Volunteering this before they extract it is much stronger. Do not invent a number.

### 9. "Every single test case passed. Did you write any test that could fail?"

> The table reports the final state of the suite, not its history — several of those cases did fail during development and drove design changes. The clearest example is duplicate-scan prevention: our first implementation enforced it in application logic alone, and under near-simultaneous requests a race condition let a duplicate through. That failure is why we added the database-level `UNIQUE` constraint on `meal_validations` — so the guarantee holds independently of the application code. The passing row you see is the result of a test that previously failed.

**Delivery note:** this is your best answer in the whole session, because it's a real engineering story with a real fix. Have it ready even if they ask a different testing question — it fits almost anywhere.

### 10. "Your unique constraint is on card, dining hall, and date. Doesn't that mean a student can only eat once per day?"

> Yes — as written, that constraint is stricter than our requirement, which is one scan per *meal session*, not per day. That's a defect. The correct constraint includes the meal session in the key — `UNIQUE (card_id, dining_hall_id, meal_session, DATE(scanned_at))` — so breakfast, lunch, and supper are each independently guarded while still blocking a repeat within the same sitting.

**Delivery note:** ⚠️ **This is a genuine bug in your documentation** (Section 4.4). If a sharp examiner reads the SQL, they will find it. Fix the constraint in the code and the document before the defence if you can. If you can't, the answer above — immediate, unhedged, with the corrected constraint stated — turns a defect into evidence that you understand your own schema. Never argue this one.

### 11. "You describe your tokens as 'signed'. Signed how? With what key, and who verifies it?"

> Be ready with a specific answer: the signing algorithm, where the key lives, and what the bank checks. If tokens are currently validated by a database status lookup and a code match rather than by verifying a cryptographic signature, say exactly that: *"In the current build, bank validation checks token authenticity by code lookup, status, and expiry against the government_tokens record — the trust boundary is the server, not a signature the bank verifies independently. True cryptographic signing, so a bank could verify a token without trusting our database, is the correct hardening and is future work."*

**Delivery note:** ⚠️ **Check your actual implementation before the defence.** Your documentation says tokens are "signed at issuance" and that a bank "rejects any token that fails signature verification." If that isn't literally implemented, know it now — being caught overstating a security property is the worst outcome available in this session.

### 12. "Your schema stores `student_name` in `meal_validations` and `school_name` in `daily_reports`. Isn't that a normalisation violation?"

> It is denormalisation, and it's deliberate. Those are audit records, not operational ones. If a student is later renamed or transferred, the attendance record that justified a payment must still show the identity as it stood at the moment of the scan — a joined-in current name would silently rewrite history and break the evidentiary value of the trail. So we store the identity as captured. The normalised relationship still exists through the foreign keys; the copied name is a point-in-time snapshot.

**Delivery note:** this is a strong answer and true to how financial and audit systems are actually built. But it only works if you say it confidently — hesitate and it reads as a rationalisation.

### 13. "You claim Agile, but Section 1.11 shows a 14-week sequential plan with testing in weeks 11–12 and documentation in week 13. That's waterfall."

> The schedule is the academic reporting artefact — the faculty timeline we had to submit against — and it does read as sequential. The development itself was iterative: each stage of the token chain was designed, built, and tested as its own increment before the next was layered on, and the UML models were revised between iterations rather than frozen after week six. Weeks 11 and 12 were system-level and integration testing, not first testing — component testing happened inside each increment.

### 14. "What is the terminal key, where is it stored, and what happens if it leaks?"

> It's a device-level shared secret that lets the kiosk authenticate without a human login, which it needs because a dining hall queue can't wait for a staff login and a shared staff account would be worse.
>
> The important property is that the terminal's capability is deliberately minimal — it can submit a card identifier for verification and nothing else. It cannot issue tokens, approve reports, generate claims, or move money. So a leaked key doesn't let anyone extract funds; it lets someone submit scans, which then have to survive fraud detection, an administrator's review, and a government officer's cross-check against enrolment before they influence a payment.
>
> That said, key rotation and per-terminal revocation would be needed for a real deployment, and we haven't implemented them.

### 15. "How do you prevent a token being redeemed twice?"

> The token lifecycle state machine enforces it server-side. A token moves Pending → Active → Submitted → Validated → Redeemed, and the transitions are guarded — once a token reaches Redeemed it cannot re-enter the chain, and it cannot be accepted past its expiry date regardless of what the requesting party claims. `GovernmentToken.status` is the single source of truth that the Government, Supplier, and Bank modules all read from; getting those three modules to agree on one status enum rather than each keeping its own view was one of the design problems we had to solve. Because the check lives in the application layer and not the client, no frontend manipulation bypasses it.

### 16. "What happens if the internet drops at the dining hall during service?"

> The current build requires connectivity, so service capture stops — and that's a real operational risk, since an outage during meal hours directly blocks attendance capture. The architecture accommodates the fix: scans are events, so they can be buffered locally at the kiosk and replayed on reconnection, with the server-side duplicate constraint still protecting correctness on replay. We scoped offline-capable scanning as future work rather than implementing it within the timeline.

---

# TIER 3 — Plausible. Know the shape of the answer.

### 17. "What if the school and the supplier collude? Or a government officer and a supplier?"

> Separation of duties defends against a single dishonest actor, not against collusion — no access-control model does. What the system provides against collusion is evidentiary: a colluding pair still has to produce scan data that survives fraud detection and reconciles against enrolment, and every artefact they produce is permanently attributable to them. Detection shifts from prevention to audit — which is a real downgrade, but it's still a large improvement on a paper system where collusion leaves no trace at all. Anomaly detection across schools, flagging a school whose attendance ratio diverges from its peers, would strengthen this and is a natural extension.

### 18. "The student has no login. How does a student contest being wrongly recorded — or wrongly not recorded?"

> Through the school administrator, who can see the scan history for any card. We deliberately gave students no portal because giving them write access to their own attendance would reintroduce exactly the self-reporting problem we're solving. The trade-off is that a student has no direct visibility into their own record, which is a legitimate criticism — a read-only student view, no write capability, would resolve it without weakening the model.

### 19. "What about lost, stolen, or shared cards?"

> Cards can be deactivated instantly by the school administrator, and an inactive card is one of the four scan outcomes the kiosk returns, so a deactivated card fails at the terminal rather than silently succeeding. Sharing is the harder case — a QR card verifies the card, not the person holding it. That's the identity-assurance gap we accepted when we chose QR over biometrics, and it's why a photo or biometric capture step at the kiosk is the highest-value single enhancement to the system.

### 20. "Why UUIDs for primary keys instead of sequential integers?"

> Two reasons. Sequential integers leak information — an outsider seeing token number 4,102 learns roughly how many tokens the system has issued, which matters when the entities are financial. And UUIDs can be generated independently across services and future schools without a central sequence, which matters for the scalability requirement. The cost is index size and slightly worse locality, which is not a meaningful trade at our scale.

### 21. "Your `users` table lists six roles but you present five actors. Which is it?"

> ⚠️ **Check this before the defence.** Your schema role enum is `school_admin | regional_officer | financial_officer | audit_officer | supplier | bank`, which splits "government" into three distinct officer roles, and the narrative presents five actors. Both can be true — five actor *categories*, with government internally subdivided — but say so deliberately: *"Five actors in the accountability model; government is subdivided into three officer roles in the implementation, because review, financial approval, and audit are separate duties within the ministry."* If that's not what the code does, align the document to the code before you walk in.

### 22. "What are `aza_api_key`, `aza_webhook_secret`, and the `payment_sessions` table? You said banking integration was simulated."

> ⚠️ **Know your answer to this one.** Your schema carries fields for what looks like a third-party payment provider integration — `aza_user_id`, `aza_api_key`, `aza_webhook_secret`, and a `payment_sessions` table with `checkout_url` and `aza_session_id` — none of which appear anywhere in your narrative chapters, which state that banking integration is simulated. An examiner reading the schema will ask. Decide now which is true and say it plainly: either it's a scaffolded integration path that is not active in the demonstrated build, or it's live and your limitations section needs correcting. Do not be surprised by this question in the room.

### 23. "Is this actually cheaper than the current system?"

> Direct costs are a tablet per dining hall, printed cards, and hosting — all modest and mostly one-off. But the honest framing is that the case isn't primarily cost reduction, it's leakage reduction: if a system covering hundreds of schools recovers even a small percentage of inflated claims, it pays for itself many times over. What we can't do is put a figure on that percentage without a pilot, because we have no measured baseline for how much leakage actually occurs. That measurement would itself be one of the first useful outputs of a deployment.

### 24. "Will schools actually adopt a system that reduces their discretion?"

> Probably not voluntarily, which is why the deployment model matters. The system's owner has to be the funding body — the Ministry or GES — not the school, because they're the party with the accountability mandate and no incentive to inflate. Schools would participate as a condition of receiving funds, the same way any audit requirement works. The offsetting benefit for an honest school is real, though: faster disbursement, because a verified digital claim can be approved far quicker than a manual reporting-and-approval cycle, and an automatic defence against being accused of inflating figures.

### 25. "You use the browser BarcodeDetector API. What about device compatibility?"

> It's natively supported in Chromium-based browsers, which covers Android tablets — the realistic kiosk hardware for this deployment, and what we specified in our hardware requirements. Support is weaker elsewhere, notably on iOS Safari. Since the kiosk is a dedicated, institution-provisioned terminal rather than a bring-your-own device, we treated that as an acceptable constraint. A WASM decoder fallback would remove the dependency entirely if broader device support were needed.

### 26. "Why both a Redis cooldown and a database UNIQUE constraint? Isn't that redundant?"

> They do different jobs. Redis handles the hot path — a fast rejection on the same card within the cooldown window, so we don't hit the primary database on every tap and the kiosk stays inside its two-second response target. The `UNIQUE` constraint is the correctness guarantee: it's what actually makes a double-count impossible, including under the race condition that our application-only implementation exposed. The cache is for speed; the constraint is for truth. Losing Redis degrades performance but not correctness — which is the right way round.

**Delivery note:** "the cache is for speed, the constraint is for truth" is a line worth keeping. It signals that you understand the difference between an optimisation and a guarantee.

### 27. "What was the hardest technical problem you solved?"

> Have one specific story ready. Your strongest candidates, all from your own Chapter 4:
> - The duplicate-scan race condition, and moving the guarantee from application logic to a database constraint (**best choice — a real bug, a principled fix**).
> - Keeping five role permission sets consistent across every endpoint, solved with a centralised role-check annotation so access rules are declared once rather than re-implemented per module.
> - Late-arriving scans versus the end-of-day report cutoff, solved by a fixed cutoff with post-cutoff scans explicitly flagged for the next cycle rather than silently dropped.

### 28. "If you had another three months, what would you build?"

> A live pilot in one participating school — everything we can't currently claim depends on that. Technically: offline-capable scanning with queued sync, cryptographic token signing so a bank can validate independently of our database, hash-chained audit entries for genuine tamper evidence, and cross-school anomaly detection to catch collusion that per-school fraud checks can't see.

---

# The four landmines — decide your answers before you walk in

These are the questions where the risk isn't that you don't know the answer, it's that the documentation contradicts itself and you get caught unprepared. Ranked by damage.

| # | Issue | Where | What to do |
|---|---|---|---|
| **1** | Tokens described as cryptographically **signed** and signature-verified by the bank. Verify this is literally implemented. | §3.8, §4.8 | Check the code. If it's a status-and-code lookup, say so plainly (Q11) and reframe signing as future work. Overstating a security property is the worst outcome available. |
| **2** | `UNIQUE (card_id, dining_hall_id, DATE(scanned_at))` allows **one meal per student per day**, contradicting your per-session requirement. | §4.4 | Fix the constraint if you can; otherwise concede immediately with the corrected version (Q10). |
| **3** | The **`aza_*` payment integration** in the schema is never mentioned in the narrative and appears to contradict "banking integration is simulated." | §3.10.2 | Decide which is true and be able to say it in one sentence (Q22). |
| **4** | Two **different schemas** for the same table: §3.10.2 has `meal_validations.card_number` as a plain VARCHAR with no foreign key; §4.4 has `card_id UUID REFERENCES cards`. | §3.10.2 vs §4.4 | Know which one the code actually implements. If asked: the §4.4 version with the foreign key is the correct one — the audit trail depends on that reference existing. |

---

# General technique

- **Concede fast, then reframe.** Every limitation in this document is one you already wrote down. A panel that finds a weakness you volunteered scores it as rigour; one that extracts it from you scores it as a gap.
- **Never guess a number.** "We didn't measure that" is a fine answer. An invented latency figure is not, and it invites follow-up you can't survive.
- **Answer the question asked**, then stop. The most common failure in a defence is answering for ninety seconds and handing the panel three new things to attack.
- **If you don't know:** *"I don't know — my working assumption would be X, but I'd want to verify it before saying so."* That is a completely acceptable answer at this level, and it's far better than confident invention.
- **The "so what" test.** If a question feels hostile, it usually isn't — panels probe hardest at the part they find most interesting. Treat a hard question as a signal that they engaged with your work.
