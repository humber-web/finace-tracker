# Personal Finance Tracker: Refined Requirements Document

This document outlines the mandatory security mandates, the strategic pivot required for integrating Caixa Económica data, and the essential functional enhancements based on the Nuxt/SQLite stack and the project's **personal-use** scope.

---

## I. Mandatory Non-Functional Requirements (Security & Integrity)

These requirements supersede all functional features and are mandatory due to the sensitive nature of financial data and the local file storage mechanism of SQLite.

| Requirement Area | Feature/Protocol | Implementation Strategy | Priority |
| :--- | :--- | :--- | :--- |
| **Data-at-Rest Encryption** | **End-to-End Encryption** (Data at Rest) | Integrate **SQLCipher** for 256-bit AES full-database encryption of the local SQLite file. This protects sensitive data if the host machine is compromised. | **CRITICAL** |
| **Key Management** | Secure Key Storage | The SQLCipher decryption passphrase **must not be hardcoded**. Manage the key via secure server environment variables. | **CRITICAL** |
| **Authentication Security** | Secure Credential Storage | Utilize **`scrypt`** hashing via Nuxt Auth Utils to securely hash and verify all user credentials. | **CRITICAL** |
| **Data Integrity** | Transaction Atomicity | Enforce **ACID compliance** for all multi-step operations (e.g., transfers, bulk imports) using explicit SQLite transactions (`BEGIN TRANSACTION`/`COMMIT`). | **HIGH** |

---

## II. Core Functional Requirements

These features build on the existing structure and must be implemented to deliver a professional-grade tracker.

### 1. Transaction Management Enhancements

#### 1.1 Recurring Transactions
- **Description**: Implement full support for creating and managing recurring scheduled transactions (e.g., monthly rent, subscriptions) to improve forecasting accuracy.
- **Implementation Details**:
  - Add `recurring_transactions` table with fields: frequency (daily/weekly/monthly/yearly), start_date, end_date, next_occurrence
  - Server-side cron job or scheduled task to auto-generate transactions on the scheduled dates
  - UI for managing recurring transaction templates
- **Priority**: HIGH

#### 1.2 Transaction Editing/Updating
- **Description**: Complete the CRUD functionality by implementing the ability to edit/update existing transactions.
- **Implementation Details**:
  - Add `PUT /api/transactions/:id` endpoint
  - Ensure updates occur within ACID-compliant transaction blocks
  - Update denormalized month/year fields if date changes
  - UI modal for editing transactions
- **Priority**: HIGH

#### 1.3 Manual Entry
- **Description**: Maintain and enhance the existing manual entry quick-add functionality for cash and non-synced transactions.
- **Status**: ✅ Already implemented
- **Priority**: COMPLETE

---

### 2. Dashboard & Visualization

#### 2.1 Custom Date Ranges
- **Description**: Implement UI and corresponding Nuxt API endpoints to allow users to define and compare arbitrary time periods (e.g., March 2023 vs. March 2024).
- **Implementation Details**:
  - Date range picker component
  - Update `/api/stats/summary` to accept date range parameters
  - Utilize SQLite date functions for efficient querying
  - Add comparison mode (Period A vs Period B)
- **Priority**: HIGH

#### 2.2 Trend Analysis
- **Description**: Implement spending patterns reporting, leveraging SQLite's `GROUP BY` and aggregate functions to highlight behavioral trends.
- **Implementation Details**:
  - Weekly/monthly spending trends
  - Category spending patterns over time
  - Peak spending days/times identification
  - Line charts for historical trends
- **Priority**: MEDIUM

#### 2.3 "Money In vs. Money Out" Comparison
- **Description**: Enhance the existing dashboard charts to clearly visualize the difference between total income and total expenses over the selected period.
- **Implementation Details**:
  - Bar chart comparing income vs expenses by month
  - Net income/loss calculation and visualization
  - Year-over-year comparison
- **Priority**: MEDIUM

---

### 3. Budgeting Tools

#### 3.1 Predictive Alerts
- **Description**: Complete the implementation of server-side logic that moves beyond simple budget checking. The application must calculate the spending velocity and issue **predictive alerts** if the user is mathematically trending toward overshooting their budget limit.
- **Implementation Details**:
  - Calculate daily spending rate for current month
  - Project end-of-month spending based on velocity
  - Alert threshold (e.g., projected to exceed budget by >10%)
  - Email/UI notification system
- **Priority**: HIGH

#### 3.2 Progress Trackers
- **Description**: Visually show budget vs. actual spending progress, highlighting the percentage spent out of the total custom budget limit.
- **Implementation Details**:
  - Progress bars for each category budget
  - Color coding (green/yellow/red based on % used)
  - Real-time updates as transactions are added
  - Monthly budget summary dashboard
- **Priority**: HIGH

---

## III. Strategic Pivot: Caixa Económica Data Ingestion

The requested feature of automatic bank sync via services like Plaid or Yodlee is **not feasible** due to the absence of a formal Open Banking framework in Cape Verde.

The strategy must pivot to a secure, semi-automated data ingestion pipeline:

### 3.1 File Upload Endpoint

| Component | Implementation Details | Priority |
| :--- | :--- | :--- |
| **API Endpoint** | Create a secure `POST /api/transactions/import` server route to receive bank statement exports from CaixaNet | **HIGH** |
| **File Size Limits** | Implement reasonable file size limits (e.g., 10MB max) | **HIGH** |
| **Security** | Validate file types, sanitize inputs, implement rate limiting | **CRITICAL** |

### 3.2 Format Handling

| Format | Parser Library | Priority |
| :--- | :--- | :--- |
| **OFX/QIF** | `node-ofx-parser` | **HIGH** (Preferred for integrity) |
| **CSV** | `papaparse` | **HIGH** (Fallback option) |
| **PDF** | Deferred to future release | **LOW** |

**Implementation Requirements**:
- Support multiple date formats (DD/MM/YYYY, MM/DD/YYYY, ISO 8601)
- Handle various currency formats
- Parse transaction descriptions
- Extract amount, date, description, reference number

### 3.3 Auto-Categorization Engine

**Description**: Develop a rule-based engine to automatically assign categories based on transaction descriptions.

**Implementation Strategy**:
```javascript
// Server-side categorization logic
const categorizationRules = [
  { keywords: ['supermarket', 'grocery', 'food'], categoryId: 1 },
  { keywords: ['gas', 'fuel', 'transport'], categoryId: 2 },
  { keywords: ['netflix', 'spotify', 'subscription'], categoryId: 5 },
  // ... more rules
]

function autoCategorizeTran(description) {
  // Match against rules
  // Return best match category or null
}
```

**Features**:
- Keyword-based matching (case-insensitive)
- User-defined custom rules (stored in database)
- Learning from user corrections (future enhancement)
- Manual review/override option in UI

**Priority**: HIGH

### 3.4 Deduplication Logic

**Description**: The ingestion pipeline must include mandatory server-side logic to identify and skip duplicate transactions.

**Deduplication Strategy**:
- Match on: amount + date + description (fuzzy match)
- Check reference/transaction ID if available
- Allow user to review potential duplicates before final import
- Store hash of transaction for quick duplicate detection

**Implementation**:
```javascript
// Generate unique hash for transaction
function generateTransactionHash(amount, date, description) {
  return crypto.createHash('sha256')
    .update(`${amount}${date}${description}`)
    .digest('hex')
}

// Add hash field to transactions table
// Check for existing hash before insert
```

**Priority**: CRITICAL

### 3.5 Import UI Workflow

1. **Upload Screen**: Drag-and-drop or file picker
2. **Preview Screen**: Show parsed transactions with auto-categorization
3. **Review Screen**: Allow user to:
   - Adjust categories
   - Mark transactions to skip
   - Handle duplicates
   - Add/edit descriptions
4. **Confirmation Screen**: Summary of what will be imported
5. **Import Execution**: Batch insert with transaction atomicity
6. **Results Screen**: Success/failure report with error details

**Priority**: HIGH

---

## IV. Deferrals and Exclusions

The following features are deferred or excluded as they conflict with the "personal use" Nuxt/SQLite architecture or represent a massive increase in complexity best suited for a later major revision:

| Feature | Status | Reason for Exclusion/Deferral |
| :--- | :--- | :--- |
| **Bank/Credit Card Sync (Plaid/Yodlee)** | ❌ **EXCLUDED** | Not supported by the Cape Verdean banking environment. Replaced by the mandatory File Ingestion Pipeline. |
| **Multi-platform Login (Google/Apple)** | ❌ **EXCLUDED** | The self-hosted, personal Nuxt/SQLite architecture mandates a simple, secure local login (already covered by `scrypt` hashing). |
| **Shared Expenses & Groups** | ❌ **EXCLUDED** | The application scope is strictly "personal use" and self-contained; multi-user logic is out of scope. |
| **Receipt Scanning (OCR)** | 🔄 **DEFERRED** | Requires complex third-party services or a significant implementation effort far beyond the MVP's data structure. |
| **Fraud Detection** | 🔄 **DEFERRED** | Requires building complex behavioral modeling and alerting mechanisms which are outside the scope of initial advanced analytics. |
| **Multi-Currency Support** | 🔄 **DEFERRED** | Add in future release if needed. For now, focus on CVE (Cape Verdean Escudo) with USD display option. |
| **Mobile App (Native iOS/Android)** | 🔄 **DEFERRED** | Focus on responsive web UI first. Consider PWA approach before native apps. |
| **Investment Tracking** | 🔄 **DEFERRED** | Out of scope for personal expense tracker. Would require portfolio management features. |
| **Tax Reporting** | 🔄 **DEFERRED** | Complex regulatory requirements. Basic export functionality can serve this need initially. |

---

## V. Implementation Phases

### Phase 1: Security Foundation (CRITICAL - DO FIRST)
- [ ] Integrate SQLCipher for database encryption
- [ ] Implement secure key management via environment variables
- [ ] Add scrypt authentication hashing
- [ ] Implement ACID transaction wrappers for critical operations

**Timeline**: 1-2 weeks

### Phase 2: Transaction Management (HIGH PRIORITY)
- [ ] Implement transaction editing/updating
- [ ] Create recurring transactions system
- [ ] Build UI for managing recurring templates

**Timeline**: 2-3 weeks

### Phase 3: Data Import Pipeline (HIGH PRIORITY)
- [ ] Build file upload endpoint
- [ ] Integrate OFX/CSV parsers
- [ ] Implement auto-categorization engine
- [ ] Create deduplication logic
- [ ] Build import UI workflow

**Timeline**: 3-4 weeks

### Phase 4: Budget Enhancements (HIGH PRIORITY)
- [ ] Implement predictive alert system
- [ ] Build budget progress trackers
- [ ] Create budget dashboard

**Timeline**: 2 weeks

### Phase 5: Analytics & Visualization (MEDIUM PRIORITY)
- [ ] Custom date range selector
- [ ] Trend analysis charts
- [ ] Income vs Expense comparisons
- [ ] Category spending patterns

**Timeline**: 2-3 weeks

---

## VI. Technical Stack Additions

The following libraries/tools must be added to support the requirements:

| Category | Library | Purpose | Priority |
| :--- | :--- | :--- | :--- |
| **Database Security** | `@journeyapps/sqlcipher` | SQLite encryption | CRITICAL |
| **Authentication** | `nuxt-auth-utils` | Secure authentication with scrypt | CRITICAL |
| **File Parsing** | `node-ofx-parser` | Parse OFX/QIF bank statements | HIGH |
| **File Parsing** | `papaparse` | Parse CSV files | HIGH |
| **File Upload** | `multer` (or Nuxt equivalent) | Handle file uploads | HIGH |
| **Scheduling** | `node-cron` | Recurring transaction generation | HIGH |
| **Date Handling** | Already using native Date | No addition needed | N/A |

---

## VII. Success Metrics

The implementation will be considered successful when:

1. ✅ Database is fully encrypted at rest with no plaintext exposure
2. ✅ Users can securely authenticate with hashed credentials
3. ✅ Users can import bank statements from CaixaNet with 95%+ auto-categorization accuracy
4. ✅ Duplicate transactions are detected with 99%+ accuracy
5. ✅ Users receive predictive budget alerts 5-7 days before projected overspend
6. ✅ All transaction operations maintain ACID compliance
7. ✅ Users can edit and manage recurring transactions
8. ✅ Dashboard displays custom date range analytics with <500ms load time

---

## VIII. Architecture Constraints

The following architectural decisions are **fixed** and must be respected:

1. **Backend**: Nuxt 4 with Nitro server
2. **Database**: SQLite with better-sqlite3 (+ SQLCipher)
3. **ORM**: Drizzle ORM
4. **Frontend**: Vue 3 with Nuxt UI
5. **Deployment**: Self-hosted, single-user
6. **Storage**: Local filesystem (no cloud dependencies)

---

## Notes

- All dates referenced assume a start date of project initiation
- Timeline estimates are for a single full-time developer
- Critical security requirements (Phase 1) must be completed before any production deployment
- Regular security audits should be conducted, especially around file upload and authentication endpoints
- Consider implementing API rate limiting for all endpoints as part of Phase 1
