# CHAPTER TWO

## REVIEW OF RELATED WORKS / REVIEW OF SIMILAR SYSTEMS

### 2.0 Introduction

This chapter reviews the categories of systems currently used to manage school feeding attendance and to disburse public funds tied to that attendance, identifies the gaps in these approaches, and presents the design of the proposed system — the **Institutional Accountability and Resource Tracking System (IARTS)**. The chapter covers the conceptual design, system architecture, component descriptions, proposed features, development tools and environment, and the expected benefits of the system.

---

### 2.1 Processes of Existing Systems

School feeding and dining hall funding programmes — such as government-subsidised school feeding initiatives — typically rely on one or a combination of the following approaches to determine how many meals were served and how much a supplier or institution should be paid. Each approach is reviewed below in terms of its features and its strengths and weaknesses.

#### 2.1.1 Manual / Paper-Based Headcount and Reimbursement Systems

**How it works:** Dining hall staff or class prefects record the number of students served at each meal in a logbook or attendance sheet. At the end of a reporting period (daily, weekly, or termly), the school administration compiles these figures into a report and submits it to the funding body (e.g. a government education office), which reviews the figures and authorises payment to the supplier.

**Features:**
- Paper registers or spreadsheet-based headcount logs
- Manual reconciliation by an administrator or accountant
- Periodic (not real-time) reporting to the funding authority

**Pros:**
- Requires no special hardware or technical skill to operate
- Very low setup cost
- Familiar to school staff and easy to adopt

**Cons:**
- Headcounts are self-reported and cannot be independently verified — a school can inflate numbers to receive more funding
- No audit trail beyond a signature; records can be altered or lost
- Slow reconciliation cycle, so fraud is only discovered (if at all) long after payment has been made
- No linkage between "meals served" and "cash released" — the two are approved as separate, disconnected steps

#### 2.1.2 RFID / Barcode-Based Cafeteria Management Systems

**How it works:** Common in universities and some boarding schools, these systems issue a card or barcode to each student, which is swiped or scanned at the dining hall entrance. The system logs the tap and, in some implementations, deducts a meal credit from the student's account.

**Features:**
- Card- or barcode-based identity check at the point of service
- Digital log of scans, usually exportable to a spreadsheet
- Sometimes integrated with a prepaid meal-credit wallet

**Pros:**
- Faster and more reliable than a paper headcount
- Produces a timestamped digital record of attendance
- Reduces queue time and manual counting errors

**Cons:**
- Built for **operational** attendance tracking (queue management, meal-credit deduction) — not for **financial accountability**. The scan data rarely feeds into a funding or payment decision
- No mechanism to prevent a school or administrator from reporting a different (inflated) number to the funding body than what the scan log actually shows
- Typically siloed within a single school; no government, bank, or supplier visibility into the same data
- Duplicate or proxy scans (one student tapping a card twice, or tapping on behalf of an absent student) are often not flagged

#### 2.1.3 Biometric Attendance Systems

**How it works:** Fingerprint or facial-recognition devices verify a student's identity before granting dining hall access, primarily to curb the "one student, one card, shared among many" abuse possible with card-only systems.

**Features:**
- Biometric identity verification at the point of service
- Digital attendance log per student, per meal

**Pros:**
- Strong identity assurance — much harder to defraud than a card swipe
- Produces reliable, individualised attendance data

**Cons:**
- Expensive hardware and higher maintenance overhead, difficult to scale across many schools with limited budgets
- Like RFID systems, the attendance data is typically consumed only by the school itself — it does not automatically drive fund disbursement to a supplier
- No end-to-end chain connecting "verified attendance" to "government token issued" to "bank releases cash," so the financial fraud risk at the reporting/reimbursement stage remains even though attendance is verified

#### 2.1.4 Mobile Money / Direct E-Payment Disbursement Systems

**How it works:** Funding bodies disburse money electronically (e.g. via mobile money or bank transfer) directly to suppliers or schools based on submitted headcount reports, replacing cash or cheque payments.

**Features:**
- Digital, traceable payment rails
- Faster disbursement than manual cheque processing

**Pros:**
- Removes cash-handling risk and speeds up payment
- Creates a payment audit trail (who was paid, how much, when)

**Cons:**
- Solves the *payment* problem but not the *verification* problem — the amount paid is still based on a self-reported or loosely audited headcount
- No real-time linkage between actual student attendance and the amount released
- Fraud simply shifts earlier in the pipeline: inflate the report, and the digital payment rail will faithfully disburse against the inflated figure

#### 2.1.5 Summary of Gaps in Existing Systems

| System type | Verifies identity? | Real-time? | Tied to fund release? | Multi-stakeholder visibility? |
|---|---|---|---|---|
| Manual/paper headcount | No | No | Loosely (manual approval) | No |
| RFID/barcode cafeteria | Card-level | Partial | No | No |
| Biometric attendance | Strong | Partial | No | No |
| Mobile money disbursement | No | No | N/A (pays on report) | Payment only |

Across all four categories, the common gap is the same: **attendance verification and fund disbursement are treated as two separate, loosely-coupled processes**. Whoever compiles the attendance report has the opportunity — and, in the case of government feeding subsidies, the financial incentive — to inflate it, because nothing downstream cross-checks the claim against the actual number of verified scans before money moves. This is the specific gap IARTS is designed to close.

---

### 2.2 The Proposed System

The **Institutional Accountability and Resource Tracking System (IARTS)** is proposed as a government-grade platform that eliminates financial fraud in school dining hall funding by tying supplier payments directly to verified student attendance data, rather than to a self-reported figure.

The system enforces one governing rule throughout the entire fund-release pipeline:

> **No verified attendance = no token = no cash released to the supplier.**

Instead of a school submitting a headcount that a funding body simply trusts, IARTS requires every meal to be backed by a **physical card tap** at the dining hall. These taps generate an attendance report that only the government can convert into a **redeemable token**, which the supplier must submit to a bank before any cash is released. Every step is visible to the party responsible for the next step, closing the reporting/verification gap identified in Section 2.1.

---

### 2.3 Conceptual Design

IARTS is built around five actors, each with a distinct, non-overlapping responsibility. No single actor can both generate and approve their own funding claim — a separation of duties that is the core fraud-prevention mechanism of the system.

| Actor | Role in the system |
|---|---|
| **Student** | Has no portal or login. Participates only via a physical card tap at the dining hall scanner. This removes any incentive or opportunity for a student to falsify their own attendance. |
| **School Admin** | Manages student and card records, monitors the dining hall feed in real time, reviews fraud alerts, and compiles the daily meal report from *actual scans* — not an estimate. |
| **Government** | Reviews each school's submitted attendance report, cross-checks it against reported enrollment, and — only if satisfied — issues a monetary **token** to the relevant supplier. |
| **Supplier** | Receives tokens issued by government, submits them to the bank for redemption, and logs food deliveries against fulfilled orders. |
| **Bank** | Independently validates each submitted token before releasing cash, and produces an audit trail of every transaction. |

**Conceptual data flow (the "token chain"):**

```
Student taps card at Dining Hall Scanner
        │
        ▼
Scan is validated (active card? already scanned? enrolled student?)
        │
        ▼
Verified scans accumulate into a Daily Attendance Report (School Admin)
        │
        ▼
Government reviews the report against enrollment & prior patterns
        │
        ▼
Government issues a Token (fixed value, tied to a supplier + institution)
        │
        ▼
Supplier receives token → submits it to the Bank
        │
        ▼
Bank validates the token (not expired, not already redeemed, matches issuance record)
        │
        ▼
Bank releases cash to the Supplier
        │
        ▼
Supplier delivers food → logs the delivery, closing the loop
```

Because every stage consumes the verified output of the stage before it, a fraudulent claim introduced at any point (e.g. an inflated headcount) has no valid scan data to point to and is rejected before money moves.

---

### 2.4 Architecture of the Proposed System

IARTS follows a **three-tier, role-partitioned client–server architecture**:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                           │
│   (React 18/19 + TypeScript SPA — one router, five isolated portals) │
│                                                                        │
│   ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│   │  School   │ │Government│ │  Bank    │ │ Supplier │ │ Scanner  │ │
│   │  Admin    │ │  Portal  │ │  Portal  │ │  Portal  │ │  Kiosk   │ │
│   │  Portal   │ │          │ │          │ │          │ │(no login)│ │
│   └───────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└──────────────────────────────┬───────────────────────────────────────┘
                                │  HTTPS (REST) + WebSocket
┌──────────────────────────────▼───────────────────────────────────────┐
│                          APPLICATION LAYER                           │
│              (Spring Boot REST API, package: com.iarts)              │
│                                                                        │
│   Auth (JWT)  │  Student/Card  │  Token  │  Payment  │  WebConfig    │
│   Module      │  Module        │  Module │  Module   │  (CORS/WS)    │
└──────────────────────────────┬───────────────────────────────────────┘
                                │
┌──────────────────────────────▼───────────────────────────────────────┐
│                            DATA LAYER                                │
│         PostgreSQL (system of record)  +  Redis (cache/sessions)     │
└────────────────────────────────────────────────────────────────────┘
```

**Layer descriptions:**

1. **Presentation Layer** — A single Vite/React/TypeScript application, role-routed (`/admin`, `/gov`, `/bank`, `/supplier`, `/scanner`) so that each actor only ever sees the screens relevant to their role. State is managed with Zustand (auth/session state) and TanStack Query (server-state caching), styled with Tailwind CSS. The Scanner Kiosk is deliberately excluded from the authenticated router — it runs as a public, browser-based QR scanning terminal (using a camera-based scanning library) authenticated only by a terminal key, since it must be usable at a physical dining hall counter without a student or staff login.

2. **Application Layer** — A Spring Boot REST API exposing endpoints grouped by domain: authentication (JWT-based), student and card management, token issuance/lifecycle, and bank payment processing. A WebSocket channel pushes live scan events from the dining hall to the School Admin portal's real-time feed.

3. **Data Layer** — PostgreSQL persists all system-of-record data (students, cards, scans, reports, tokens, transactions). Redis is used for caching and short-lived session/state data (e.g. terminal key validation, rate-limiting scan bursts).

This layered separation means the frontend never has to trust client-side logic for anything financial — every token issuance and cash release decision is enforced server-side, and the presentation layer is purely a role-scoped view onto that state.

---

### 2.5 Component Designs and Component Descriptions

*(Detailed algorithms for each component are presented in Chapter 4. This section describes what each component does and how it functions within the overall architecture.)*

**2.5.1 Dining Hall Scanner Kiosk**
A browser-based, camera-driven QR/card scanning terminal with no user login. It authenticates itself to the backend using a fixed terminal key rather than a user session. On each scan it sends the card identifier to the backend, which returns one of four outcomes — *served*, *unknown card*, *duplicate scan*, or *inactive student* — displayed instantly on the kiosk screen so dining hall staff can act on it (e.g. deny a duplicate or unrecognised card) without needing to consult a separate system.

**2.5.2 School Admin Portal**
Gives school staff: (a) a live dining hall feed reflecting scans as they happen, (b) student and card registry management (issuing/deactivating cards), (c) fraud alerts flagging anomalies such as duplicate or unusually-timed scans, (d) meal report compilation drawn directly from verified scan records (not manual entry), and (e) supply logging to track deliveries received against orders.

**2.5.3 Government Portal**
Splits government oversight into role-scoped dashboards (Regional, Financial, and Audit officer views) so that reviewing attendance reports, calculating budget allocations, and issuing tokens are handled by clearly separated responsibilities. Includes a claims workflow for reviewing/approving reimbursement claims, a token ledger for tracking every token issued, and a school-level detail view for drilling into a specific institution's history.

**2.5.4 Supplier Portal**
Gives suppliers a token inbox for tokens issued to them, a submission flow for sending tokens to the bank for redemption, a delivery logger for recording food delivered against fulfilled orders, transaction history, and a reorder monitor that flags low-stock items needing replenishment.

**2.5.5 Bank Portal**
Provides the final independent check in the chain: a pending-tokens queue, a validation screen to accept or reject a submitted token, a cash-release action (only enabled after validation), a rejected-tokens log, a full transaction log, and an audit report view for reconciliation.

**2.5.6 Shared UI Component Library**
A common set of primitives (`Button`, `Badge`, `Modal`, `DataTable`, `StatCard`, `DropdownMenu`, `Icon`) and layout shells (`DashboardLayout`, `PageHeader`, `Sidebar`) used consistently across all four authenticated portals, so each portal looks and behaves consistently without duplicating UI code.

**2.5.7 Authentication & Authorization Module**
Issues JWTs on login and enforces role-based route access both client-side (router guards mapping each role to its portal) and server-side (Spring Security filter chain validating the JWT and role claim on every request).

**2.5.8 Token Lifecycle Module**
Owns the state machine governing a token from issuance to redemption: `pending → active → redeemed`, with `expired` and `rejected` as terminal failure states — ensuring a token can never be spent twice or accepted after its validity window.

---

### 2.6 Proposed System / Software Features

- Physical card-tap attendance capture — no self-reported headcounts
- Real-time dining hall scan feed visible to school administration
- Automatic duplicate-scan and anomaly (fraud) detection
- Attendance-report-to-token issuance workflow, reviewable by government before approval
- Role-partitioned government oversight (regional, financial, and audit views)
- Full token lifecycle tracking (issued → submitted → validated → redeemed/rejected/expired)
- Independent bank-side validation step before any cash is released
- Supplier delivery logging tied back to the token/order that funded it
- Low-stock reorder alerts for suppliers
- End-to-end audit trail spanning all five actors, so any claim can be traced back to the underlying verified scans

---

### 2.7 Development Tools and Environment

**Frontend**
- React 18/19 with TypeScript, bundled and served by Vite
- React Router v6/v7 for role-based routing
- Zustand for client/auth state, TanStack Query for server-state caching
- Axios for HTTP communication with the backend
- Tailwind CSS v3 for styling, with `lucide-react` for icons
- `react-hot-toast` for user notifications
- `qrcode.react` / a browser-based camera QR library for the scanner kiosk

**Backend**
- Java with Spring Boot (REST API), organised by domain package (`auth`, `student`, `token`, `payment`, `config`)
- Spring Security with JWT for authentication/authorisation
- PostgreSQL as the primary relational database
- Redis for caching and session/rate-limit state
- WebSocket for pushing live scan events to the School Admin portal
- Maven for backend build and dependency management

**Tooling & Environment**
- Visual Studio Code (frontend) and IntelliJ IDEA (backend) as primary IDEs
- Git and GitHub for version control
- Figma for UI/UX design, translated directly into React components
- Postman for API testing during backend integration
- Planned deployment: Render.com for the backend, Vercel for the frontend

---

### 2.8 Benefits of Implementation of the Proposed System

- **Fraud prevention at the source** — funding decisions are based on verifiable card-tap data instead of a figure any single party could inflate.
- **Faster, more defensible audits** — every cash release traces back through a token to a specific set of verified scans, rather than relying on paper trails compiled after the fact.
- **Accountability without added burden on students** — students participate only by tapping a card; no portal, login, or extra process is imposed on them.
- **Separation of duties** — no actor can both generate a funding claim and approve it, closing the loophole present in all four existing-system categories reviewed in Section 2.1.
- **Real-time visibility** — school administrators, government reviewers, suppliers, and banks all see the same underlying data as it happens, rather than reconciling mismatched paper records after the fact.
- **Reduced disbursement delay** — because the token pipeline is digital end-to-end, verified attendance can move to an issued token and, ultimately, released cash, faster than a manual reporting-and-approval cycle.
- **Scalable oversight** — the same architecture can extend to additional schools, suppliers, or banks without redesigning the accountability model, since each new participant simply plugs into the existing token chain.

---

*End of Chapter 2.*
