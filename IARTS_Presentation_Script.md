# IARTS — Final Year Project Presentation Script

**Institutional Accountability and Resource Tracking System**
*A Web-Based Platform for Attendance-Verified Fund Disbursement in Government-Funded School Feeding Programmes*

Presented by: Essandoh Prince Takyi (3390922) & Haruna Bawumia Fahad (3393222)
Supervisor: Dr. Agyemang
KNUST — Department of Computer Science

**Target runtime: ~15 minutes speaking + 5–10 minutes questions.**
Timings are cumulative. Handover points for the two-presenter split are marked `[SWITCH]` — delete them if one person presents.

---

## SLIDE 1 — Title (0:00 – 0:40)

> Good morning. My name is Prince Essandoh Takyi, and with me is Haruna Bawumia Fahad. Our supervisor is Dr. Agyemang.
>
> Our project is the Institutional Accountability and Resource Tracking System — IARTS. It is a web-based platform for attendance-verified fund disbursement in government-funded school feeding programmes.
>
> I want to start not with the software, but with the problem it exists to solve.

---

## SLIDE 2 — The Problem (0:40 – 2:30)

> Ghana's Free SHS programme feeds hundreds of thousands of students every day, and the government pays suppliers based on how many meals were served. The question is: how does the government know how many meals were actually served?
>
> Today, in most schools, the answer is a headcount. Dining hall staff or prefects count students into a logbook. At the end of the period, the school compiles those figures into a report, submits it to the funding body, and the funding body pays against it.
>
> There are two problems with that. The first is that the number is self-reported — nobody downstream can independently confirm it. The second is more serious: **the person who writes the number benefits from the number being large.** Funding is tied to reported attendance, so whoever compiles the report has both the opportunity and the incentive to inflate it.
>
> And nothing in the pipeline cross-checks that claim before public money moves.
>
> That is the gap. Attendance verification and fund disbursement are two disconnected steps, and the join between them is a piece of paper that everybody has to trust.

**Delivery note:** slow down on the two bolded sentences. This is the sentence the panel should remember. Pause after "before public money moves."

---

## SLIDE 3 — Existing Approaches & Why They Don't Close It (2:30 – 4:30)

> We reviewed four categories of existing systems, and each one solves a piece of this but leaves the gap open.
>
> **Manual paper headcounts** are cheap and familiar, but self-reported and unverifiable, with no audit trail beyond a signature.
>
> **RFID and barcode cafeteria systems** — common in universities — give you a fast, timestamped digital scan log. But they were built for operational tracking, not financial accountability. The scan data rarely feeds a funding decision, and nothing stops a school from reporting a different figure than the scan log shows.
>
> **Biometric attendance systems** give the strongest identity assurance — very hard to defraud a fingerprint. But the hardware is expensive and hard to scale, and critically, the attendance data is consumed only by the school. There is still no chain connecting a verified scan to a cash release.
>
> **Mobile money and direct e-payment disbursement** makes the payment traceable and fast. But it solves the payment problem, not the verification problem. The rail will faithfully disburse against an inflated figure. Fraud simply shifts one step earlier.
>
> So the pattern across all four is the same: some of them verify identity, some of them are digital, some of them are real-time — but none of them ties verified attendance to fund release, and none of them gives all the stakeholders visibility into the same chain.

**If the slide has the comparison table:** point at the "Tied to Fund Release?" column and say — *"This is the column that matters, and it is empty."*

`[SWITCH]` — Prince hands over to Fahad here.

---

## SLIDE 4 — Aim and Objectives (4:30 – 5:30)

> Our aim was to design and implement IARTS: an automated attendance verification and resource tracking system that enables accurate verification of student attendance, secure fund disbursement, and full transparency in the allocation of public education funds.
>
> Our specific objectives were seven:
>
> One — build a centralized attendance verification system around QR-enabled dining cards.
> Two — generate a secure, unique QR identity for every enrolled student.
> Three — capture meal attendance in real time at the point of service.
> Four — implement a token-based workflow that ties disbursement directly to verified attendance.
> Five — implement role-based access control across school, government, supplier, and bank.
> Six — generate automated, audit-ready reports to support disbursement decisions.
> Seven — reduce fraudulent reporting and resource misallocation in participating schools.

**Delivery note:** don't read all seven at full pace — group them. "The first three are about capturing truth at the dining hall. The middle two are about who is allowed to act on it. The last two are about proving it afterwards."

---

## SLIDE 5 — The Governing Rule (5:30 – 6:15)

> Everything in IARTS follows from a single rule that we enforce through the entire pipeline:
>
> **No verified attendance, no token. No token, no cash released to the supplier.**
>
> Instead of a school submitting a headcount that a funding body simply trusts, every meal in IARTS has to be backed by a physical card tap at the dining hall. Those taps produce an attendance report. Only the government can convert that report into a redeemable token. And the supplier must submit that token to a bank before any cash moves.
>
> Every step consumes the verified output of the step before it. So a fraudulent claim introduced anywhere in the chain has no valid scan data underneath it, and it is rejected before money moves.

**Delivery note:** this is the thesis of the whole project. State the rule, then stop and let it sit for a beat before continuing.

---

## SLIDE 6 — The Five Actors and Separation of Duties (6:15 – 8:00)

> IARTS is built around five actors, each with a distinct, non-overlapping responsibility. The design principle is separation of duties: **no single actor can both generate and approve their own funding claim.**
>
> **The student** has no portal and no login at all. They participate only by tapping a physical card at the dining hall scanner. That is deliberate — it removes any opportunity for a student to falsify their own attendance.
>
> **The school administrator** manages student and card records, monitors the dining hall feed live, reviews fraud alerts, and compiles the daily meal report — drawn from actual scans, not an estimate.
>
> **The government** reviews each school's submitted report, cross-checks it against reported enrolment, and only if satisfied, issues a monetary token to the supplier.
>
> **The supplier** receives tokens, submits them to the bank for redemption, and logs food deliveries against fulfilled orders.
>
> **The bank** performs the final independent check — it validates each token before releasing cash, and produces the audit trail.
>
> Notice what this means in practice. The school can produce a claim but cannot fund it. The government can authorise a payment but cannot create the attendance that justifies it. The supplier can request money but cannot release it. And the bank can release money but only against a token it has independently validated.

**Delivery note:** the last paragraph is the strongest argument in the presentation. Deliver it as four separate sentences, with a small pause between each.

`[SWITCH]` — Fahad hands back to Prince for the architecture.

---

## SLIDE 7 — System Architecture (8:00 – 9:45)

> IARTS follows a three-tier, role-partitioned client–server architecture.
>
> **The presentation layer** is a single Vite, React and TypeScript application, role-routed so each actor only ever sees the screens relevant to their role — `/admin`, `/gov`, `/bank`, `/supplier`, and `/scanner`. We use Zustand for authentication and session state, TanStack Query for server-state caching, and Tailwind CSS for styling.
>
> One design decision worth calling out: the Scanner Kiosk is deliberately excluded from the authenticated router. It runs as a public browser-based QR terminal authenticated only by a terminal key — because it has to be usable at a physical dining hall counter, at speed, without a student or a staff member logging in.
>
> **The application layer** is a Spring Boot REST API, with endpoints grouped by domain: JWT authentication, student and card management, token issuance and lifecycle, and bank payment processing. A WebSocket channel pushes live scan events from the dining hall to the school admin portal, so the feed updates without a page refresh.
>
> **The data layer** is PostgreSQL for all system-of-record data — students, cards, scans, reports, tokens, transactions — with Redis for caching and short-lived state such as terminal key validation and rate-limiting scan bursts.
>
> The important consequence of this layering is that the frontend never has to be trusted for anything financial. Every token issuance and every cash release decision is enforced server-side. The presentation layer is purely a role-scoped view onto that state.

**Delivery note:** if you're running long, the layer names and the last paragraph are the essential parts — the state-management library names can be dropped.

---

## SLIDE 8 — Key Components (9:45 – 11:15)

> Briefly, the main components:
>
> **The Dining Hall Scanner Kiosk** is a camera-driven QR terminal. On each scan it returns one of four outcomes instantly — served, unknown card, duplicate scan, or inactive student — so staff can act on it at the counter without consulting another system. A three-second cooldown prevents the same card being submitted twice in quick succession.
>
> **The School Admin Portal** carries the live dining hall feed, the student and card registry, a fraud alert dashboard flagging duplicate or unusually-timed scans, and daily report compilation. Reports move through a four-stage review pipeline — Generated, Operational Review, Compliance Review, and Claim Eligible — before they can back a reimbursement claim.
>
> **The Government Portal** holds token issuance, the claims approval workflow, a token ledger of every token ever issued, and a budget calculator for per-student allocations.
>
> **The Supplier Portal** provides a token inbox, the bank submission workflow, a delivery logger, transaction history, and low-stock reorder alerts.
>
> **The Bank Portal** is the final independent check — a pending-token queue, a validation screen, a cash-release action enabled *only* after successful validation, a rejected-token log with reasons, and an audit report view.
>
> Underneath all four authenticated portals sits a shared UI component library and a common authentication module that enforces role access twice: client-side through router guards, and server-side through a Spring Security filter chain that validates the JWT and the role claim on every single request.

**Delivery note:** this slide is a list, so it drags easily. Keep the pace up and put the emphasis on the *bolded portal names* rather than the feature lists.

---

## SLIDE 9 — The Token Lifecycle (11:15 – 12:15)

> The heart of the fraud prevention is the token lifecycle module. A government token moves through seven states: **Pending, Active, Submitted, Validated, Redeemed, Expired, and Rejected.**
>
> The module enforces two invariants server-side. First, a token can never be spent twice — once it is redeemed, it cannot re-enter the chain. Second, a token cannot be accepted after its expiry date, regardless of what the requesting party claims.
>
> This is what makes the audit trail work in both directions. From any cash release, you can trace backwards through the bank validation, the supplier submission, the government issuance, the approved daily report, and finally to the individual verified card scans that justified it.

**If you have the sequence diagram slide, walk it here — left to right, one sentence per actor. Do not narrate every arrow.**

---

## SLIDE 10 — Live Demonstration (12:15 – 14:15)

> I'd like to show the chain end to end.

**Demo sequence — keep it to four moves, narrating as you go:**

1. **Scanner:** tap a valid card → "Served." Tap the same card again → "Duplicate scan." *"That rejection is the fraud engine working at the counter, in real time."*
2. **School Admin:** show the live feed with those scans appearing, then compile the daily report. *"This number is not typed in by anyone. It is derived from the scans you just watched happen."*
3. **Government:** open the submitted report, approve it, issue a token to the supplier. *"The government cannot create attendance — it can only act on what the school's verified scans produced."*
4. **Supplier → Bank:** submit the token, then validate and release it on the bank side. *"And the bank is the only actor that can move money, and only against a token it has independently validated."*

**Demo safety notes:**

- Have the app already running and logged into all portals in separate tabs before you start. Do not log in live.
- If the camera or scanner fails, say: *"I'll use the manual card entry path — the backend logic is identical from this point on."* Have that fallback tested.
- If anything breaks, do not debug in front of the panel. Move to the screenshots slide and keep talking.

---

## SLIDE 11 — Scope, Limitations, Findings (14:15 – 15:15)

> On scope and honesty about what we built:
>
> IARTS does **not** integrate with live national identity databases or real banking core systems. Those external dependencies are simulated within the system environment for demonstration. That was a deliberate scoping decision — access to live government educational datasets is restricted by data-privacy policy, and direct integration with the National Identification Authority or a bank's core was not available to us during development.
>
> Our development and testing therefore relied significantly on simulated data patterns, and the academic calendar limited us to functional testing rather than a long-term pilot in a real dining hall.
>
> What we did demonstrate is that the accountability chain itself holds: role-based access is correctly enforced on every request, tokens cannot be double-spent or redeemed after expiry, duplicate scans are detected and rejected at the point of service, and every cash release in the system is traceable back to the individual scans that justified it.

**Delivery note:** state the limitations plainly and without apology. Panels reward candour here, and volunteering a limitation is much stronger than having it extracted from you.

---

## SLIDE 12 — Contribution, Future Work, Close (15:15 – 16:00)

> Academically, this project contributes to software engineering, database systems, and information security by demonstrating how a role-partitioned, token-driven architecture can be applied to a real public-sector accountability problem.
>
> Practically, it gives educational authorities a mechanism to detect resource leakage faster than manual tracking allows.
>
> Future work would be a live pilot in a participating SHS, real NIA identity integration for card issuance, integration with an actual bank settlement API, and an offline-capable scanner for dining halls with unreliable connectivity.
>
> To close where we started: the problem was never that people cannot count students. The problem was that the count and the cash were two separate steps, joined by trust. IARTS replaces that trust with a verified chain.
>
> Thank you. We're happy to take questions.

---

# Anticipated Questions & Answers

**"What stops a school administrator from just tapping cards for absent students?"**
> Nothing in software alone stops physical card abuse — that's a genuine limitation and we're upfront about it. What the system does is make it detectable and costly: the fraud engine flags duplicate scans and unusually-timed clusters, every scan is timestamped and attributed to a terminal, and the audit trail is visible to the government reviewing the report, not just to the school. The natural next step is biometric or photo capture at the terminal, which we've scoped as future work.

**"Why QR rather than RFID or biometrics?"**
> Cost and scale. Biometrics gives stronger identity assurance but the hardware cost per dining hall makes national rollout across hundreds of schools impractical — that was one of the weaknesses we identified in the literature. A QR dining card can be printed cheaply and reissued instantly if lost, and any camera-equipped device becomes a terminal. We treated identity assurance as an upgrade path, not a prerequisite, because the core contribution is the token chain — which works with any attendance capture method.

**"How is this different from an RFID cafeteria system?"**
> An RFID system stops at the scan log. IARTS starts there. The differentiator is not the capture method, it's that the scan data is the only thing that can produce a token, and the token is the only thing that can release cash. That's the link none of the reviewed systems had.

**"Why does the scanner not require a login? Isn't that a security hole?"**
> It's a deliberate trade-off. A dining hall queue at 7am cannot wait for a staff login, and a shared staff account is worse than no account. So the terminal authenticates with a terminal-specific key rather than a user session, and it is deliberately excluded from the authenticated router. The key point is that the terminal has exactly one capability — submit a card ID for verification. It cannot issue tokens, approve reports, or move money. The blast radius of a compromised terminal key is bounded to scan submission, which the fraud engine then screens.

**"What happens if the internet goes down at the dining hall?"**
> That's a real operational risk and the current build requires connectivity. Offline-capable scanning with a queued sync is in our future work. The design accommodates it — scans are events, so they can be buffered locally and replayed — but we did not implement it within the project timeline.

**"How do you prevent a token being redeemed twice?"**
> It's enforced in the token lifecycle state machine, server-side. A token moves Pending → Active → Submitted → Validated → Redeemed, and the transition is guarded — a token in Redeemed cannot re-enter the chain. Because that check lives in the application layer and not the client, a supplier or a bank clerk cannot bypass it by manipulating the frontend.

**"Did you test with real data?"**
> No, and that's a stated limitation. Live government feeding programme data is restricted by data-privacy policy, so we tested with simulated data patterned on realistic school enrolment and meal-service volumes. What that lets us validate is the correctness of the logic and the enforcement of the access rules; what it does not let us validate is real-world operational load and human behaviour in a live dining hall. That's what a pilot would tell us.

**"Who owns the system in a real deployment — who hosts it?"**
> The natural owner is the funding body — Ministry of Education or GES — because they are the party with the accountability mandate and the one actor with no incentive to inflate a claim. Schools, suppliers, and banks would be onboarded as tenants with role-scoped access rather than as system owners.

**"What was the hardest part?"**
> [Answer honestly — the panel is testing whether you built it. Good candidates: enforcing the role boundary consistently in two places at once, client-side guards and the Spring Security filter chain, without them drifting out of sync; or getting the WebSocket live feed to stay consistent with the cached query state so the admin feed never showed a stale count.]

---

# Rehearsal Checklist

- [ ] Full run-through with a timer — target 15 minutes, hard stop at 18
- [ ] Demo run three times, including once with the scanner deliberately failing
- [ ] All portals pre-logged-in in separate tabs; laptop on mains power; notifications off
- [ ] Screenshot fallback slides prepared for every demo step
- [ ] Backend and database confirmed running immediately before you walk in
- [ ] Agree the `[SWITCH]` handover points with Fahad and rehearse them — handovers are where presentations lose momentum
- [ ] Know your Slide 2 opening and your Slide 12 closing by heart; you can read the middle
