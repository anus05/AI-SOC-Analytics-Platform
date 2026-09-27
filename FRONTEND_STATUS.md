# SOC VIGIL Frontend Status & Technical Audit

This document provides a comprehensive technical audit of the SOC VIGIL frontend (`frontend/src/`). All items include exact file and line number citations.

---

## 1. PAGES STATUS

### 1.1 `LoginPage.jsx`
- **Renders without errors**: ✅ Yes ([LoginPage.jsx:L16-L503](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L16-L503))
- **Implemented Features**:
  - ✅ Passphrase show/hide toggle ([LoginPage.jsx:L275-L285](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L275-L285))
  - ✅ Embedded Forgot-Password view switch ([LoginPage.jsx:L306-L313](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L306-L313), [L120-L129](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L120-L129))
  - ✅ Form validation for email & password ([LoginPage.jsx:L111-L138](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L111-L138))
  - ⚠️ Google Sign-In button: Loads official Google Identity Services script when `VITE_GOOGLE_CLIENT_ID` is present ([LoginPage.jsx:L41-L64](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L41-L64)); if unconfigured or prompt fails, falls back to a Dev Sandbox modal ([LoginPage.jsx:L73-L81](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L73-L81), [L402-L498](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L402-L498))
  - ❌ Rate limiting on forgot password requests: Missing (no cooldown timer or request limit enforced on UI)
- **Backend Endpoints Called**: Calls real API endpoints `/auth/login` ([L54](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L54)), `/auth/register` ([L90](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L90)), `/auth/google` ([L111](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L111)), and `/auth/forgot-password` ([L136](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L136)) via `AuthContext.jsx`.
- **Console Warnings/Errors**: None on render.

### 1.2 `ForgotPasswordPage.jsx`
- **Renders without errors**: ❌ Missing as a standalone file.
- **Notes**: The forgot-password flow is embedded directly inside `LoginPage.jsx` via mode state (`mode === 'forgot'`) ([LoginPage.jsx:L21](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L21), [L120-L129](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L120-L129)). No dedicated `ForgotPasswordPage.jsx` file exists in `frontend/src/pages/`.

### 1.3 `ResetPasswordPage.jsx`
- **Renders without errors**: ✅ Yes ([ResetPasswordPage.jsx:L5-L231](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L5-L231))
- **Implemented Features**:
  - ✅ Extracts token from URL query parameters `?token=...` ([ResetPasswordPage.jsx:L20-L25](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L20-L25))
  - ✅ Password & Confirm Password input fields with independent show/hide toggles ([ResetPasswordPage.jsx:L146-L156](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L146-L156), [L178-L188](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L178-L188))
  - ✅ Validation for token presence, minimum length, and password match ([ResetPasswordPage.jsx:L33-L51](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L33-L51))
  - ✅ Auto-redirect to `/login` after 2.5 seconds on success ([ResetPasswordPage.jsx:L59-L61](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L59-L61))
- **Backend Endpoints Called**: Calls real `/auth/reset-password` endpoint via `AuthContext.resetPassword` ([ResetPasswordPage.jsx:L54](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ResetPasswordPage.jsx#L54), [AuthContext.jsx:L150](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L150)).
- **Console Warnings/Errors**: None.

### 1.4 `DashboardPage.jsx`
- **Renders without errors**: ✅ Yes ([DashboardPage.jsx:L11-L436](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L11-L436))
- **Implemented Features**:
  - ✅ Bento Grid Stat cards: Total Alerts, High-Severity, Avg Threat Score, Today's Detections ([DashboardPage.jsx:L224-L254](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L224-L254))
  - ✅ Alerts Over Time chart & Attack Type distribution chart ([DashboardPage.jsx:L266](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L266), [L284](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L284))
  - ✅ Recent Incident Logs table with severity color indicators ([DashboardPage.jsx:L320-L359](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L320-L359))
  - ✅ "Ingest Security Logs" Modal trigger ([DashboardPage.jsx:L175-L181](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L175-L181))
  - ✅ Live Threat Scanner trigger (`POST /scan`) ([DashboardPage.jsx:L373-L400](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L373-L400))
  - ✅ Adaptive Polling (20s base poll interval, exponential backoff, max 5 error pause) ([DashboardPage.jsx:L34-L35](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L34-L35), [L85-L103](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L85-L103))
  - ✅ Persistent Connection Error Banner on polling failure ([DashboardPage.jsx:L206-L219](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L206-L219))
- **Backend Endpoints Called**: Calls real `/dashboard` ([useAlerts.js:L61](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L61)) and `/scan` ([useAlerts.js:L190](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L190)).
- **Console Warnings/Errors**: None.

### 1.5 `AlertsPage.jsx`
- **Renders without errors**: ✅ Yes ([AlertsPage.jsx:L8-L137](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/AlertsPage.jsx#L8-L137))
- **Implemented Features**:
  - ✅ 300ms Debounced search input ([AlertFilters.jsx:L6-L11](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertFilters.jsx#L6-L11))
  - ✅ Severity & Attack filter chips ([AlertFilters.jsx:L18-L26](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertFilters.jsx#L18-L26))
  - ✅ Paginated table with PREV/NEXT controls ([AlertTable.jsx:L156-L178](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L156-L178))
  - ✅ Column sorting (ID, Severity, Threat Score) ([AlertTable.jsx:L57-L62](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L57-L62))
  - ✅ Sticky table header (`sticky top-0 z-20`) ([AlertTable.jsx:L68](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L68))
  - ✅ Cell text truncation (`truncate` class with title tooltips) ([AlertTable.jsx:L121](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L121), [L127](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L127), [L130](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L130), [L133](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L133), [L136](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L136), [L139](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L139), [L145](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L145))
- **Backend Endpoints Called**: Calls real `/alerts` endpoint with query parameters ([useAlerts.js:L143](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L143)).
- **Console Warnings/Errors**: None.

### 1.6 `AlertDetailPage.jsx`
- **Renders without errors**: ✅ Yes ([AlertDetailPage.jsx:L9-L132](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/AlertDetailPage.jsx#L9-L132))
- **Implemented Features**:
  - ✅ Incident metadata breakdown (ID, User, Source IP, Destination Host) ([AlertDetail.jsx:L122-L148](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertDetail.jsx#L122-L148))
  - ✅ Optimistic status updates (DISMISS, FALSE POSITIVE, ESCALATE TIER 2) with immediate state mutation and automatic rollback on failure ([AlertDetailPage.jsx:L34-L52](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/AlertDetailPage.jsx#L34-L52))
  - ✅ Raw log viewer with copy-to-clipboard button ([AlertDetail.jsx:L152-L173](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertDetail.jsx#L152-L173))
  - ✅ Toggleable AI Copilot investigation panel & Explainable score card ([AlertDetailPage.jsx:L122-L127](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/AlertDetailPage.jsx#L122-L127))
- **Backend Endpoints Called**: Calls real `/alerts/{id}` ([useAlerts.js:L175](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L175)), `PUT /alerts/{id}` ([useAlerts.js:L205](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L205)), `/explain-score/{id}` ([ExplainableScoreCard.jsx:L14](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/ExplainableScoreCard.jsx#L14)), and `/api/copilot/investigate/{id}` ([AICopilotPanel.jsx:L21](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/copilot/AICopilotPanel.jsx#L21)).
- **Console Warnings/Errors**: None.

### 1.7 `StatisticsPage.jsx`
- **Renders without errors**: ✅ Yes ([StatisticsPage.jsx:L17-L348](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L17-L348))
- **Implemented Features**:
  - ✅ Model Precision & Confidence SVG Gauge ([StatisticsPage.jsx:L184-L207](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L184-L207))
  - ✅ Attack Vector Distribution Doughnut Chart with legend Breakdown ([StatisticsPage.jsx:L217-L240](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L217-L240))
  - ✅ Weekly Detection Trend Bar Chart ([StatisticsPage.jsx:L244-L251](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L244-L251))
  - ✅ MITRE ATT&CK Technique Breakdown List ([StatisticsPage.jsx:L254-L277](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L254-L277))
  - ✅ Top Malicious Source IP Address Ranges table ([StatisticsPage.jsx:L280-L342](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L280-L342))
- **Backend Endpoints Called**: Calls real `/statistics` endpoint via `useAlerts.getStatisticsData` ([useAlerts.js:L96](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L96)).
- **Console Warnings/Errors**: None.

### 1.8 Unrequested Existing Pages Found
1. **`AttackTimelinePage.jsx`**: ✅ Implemented ([AttackTimelinePage.jsx:L6-L136](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/AttackTimelinePage.jsx#L6-L136)). Renders interactive attack graph calling `/api/attack-chain`.
2. **`IncidentReportsPage.jsx`**: ✅ Implemented ([IncidentReportsPage.jsx:L6-L173](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/IncidentReportsPage.jsx#L6-L173)). Renders report list, generates PDF reports (`POST /api/report/generate/1`), and downloads PDFs (`GET /api/report/download/{id}`).
3. **`InvestigationPage.jsx`**: ✅ Implemented ([InvestigationPage.jsx:L7-L110](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/InvestigationPage.jsx#L7-L110)). Standalone AI Copilot & Explainable scoring workspace.
4. **`ThreatIntelPage.jsx`**: ✅ Implemented ([ThreatIntelPage.jsx:L6-L145](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/ThreatIntelPage.jsx#L6-L145)). Interactive IP threat intel lookup canvas (`GET /api/threat-intel/lookup/{ip}`).

---

## 2. COMPONENTS AUDIT

| Component | Status | Location | Notes & Implemented Features |
| :--- | :---: | :--- | :--- |
| `common/StatCard.jsx` | ✅ | [StatCard.jsx:L3-L34](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/common/StatCard.jsx#L3-L34) | Renders title, value, diff, icon, pulse indicator, loading skeleton, and background SVG sparkline. |
| `common/SeverityBadge.jsx` | ✅ | [SeverityBadge.jsx:L3-L34](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/common/SeverityBadge.jsx#L3-L34) | Renders flat badges for `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`. |
| `charts/AlertsOverTimeChart.jsx` | ⚠️ | [AlertsOverTimeChart.jsx:L26-L128](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AlertsOverTimeChart.jsx#L26-L128) | ✅ Tooltips & Empty state & Loading skeleton implemented.<br/>❌ Legend toggling missing (`legend.display = false` at [L84](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AlertsOverTimeChart.jsx#L84)). |
| `charts/AttackTypeChart.jsx` | ✅ | [AttackTypeChart.jsx:L15-L160](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AttackTypeChart.jsx#L15-L160) | ✅ Tooltips, interactive legend category toggling ([L18-L32](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AttackTypeChart.jsx#L18-L32)), & Empty state implemented.<br/>⚠️ Note: Contains default prop value `totalAlerts = 1284` at [L15](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AttackTypeChart.jsx#L15). |
| `alerts/AlertTable.jsx` | ✅ | [AlertTable.jsx:L4-L181](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L4-L181) | ✅ Column sorting ([L57-L62](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L57-L62)), Pagination ([L156-L178](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L156-L178)), Sticky header (`sticky top-0 z-20` at [L68](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L68)), and Overflow truncation (`truncate` utility with tooltips at [L121](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertTable.jsx#L121)). |
| `alerts/AlertFilters.jsx` | ✅ | [AlertFilters.jsx:L3-L69](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertFilters.jsx#L3-L69) | ✅ 300ms Debounced search input ([L6-L11](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertFilters.jsx#L6-L11)) & filter chips ([L18-L26](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertFilters.jsx#L18-L26)). |
| `alerts/AlertDetail.jsx` | ✅ | [AlertDetail.jsx:L3-L205](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertDetail.jsx#L3-L205) | ✅ Connection metadata, raw log viewer with copy button ([L158-L166](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/alerts/AlertDetail.jsx#L158-L166)), and status update actions. |
| `layout/Sidebar.jsx` | ⚠️ | [Sidebar.jsx:L4-L108](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Sidebar.jsx#L4-L108) | ✅ Active-route highlighting via `NavLink` `isActive` ([L30-L36](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Sidebar.jsx#L30-L36)).<br/>⚠️ Mobile behavior: Sidebar is hidden via `hidden md:flex` ([L23](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Sidebar.jsx#L23)) and replaced by a fixed bottom bar ([L83-L105](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Sidebar.jsx#L83-L105)). There is no collapsible drawer hamburger menu toggle. |
| `layout/Navbar.jsx` | ✅ | [Navbar.jsx:L4-L105](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Navbar.jsx#L4-L105) | ✅ Status badge, user initials/avatar, and operator dropdown menu with sign-out. |

---

## 3. STATE, HOOKS, AND API LAYER

### 3.1 `AuthContext.jsx`
- **JWT Storage**: Stores token in `localStorage.getItem("soc_token")` / `localStorage.setItem("soc_token", access_token)` ([AuthContext.jsx:L17](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L17), [L61](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L61)). Note: Initializes with `"dev_bypass_token"` fallback if localStorage is empty ([L17](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L17)).
- **Session-Expiry Handling**: Listens for custom `auth-unauthorized` event emitted by `client.js` on HTTP 401 response ([AuthContext.jsx:L34-L46](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L34-L46)), invoking `logout()` and displaying session expired error.
- **Google Auth Integration**: Integrates with `/auth/google` backend endpoint ([AuthContext.jsx:L111](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L111)).

### 3.2 `useAlerts.js` Polling & Cadence
- **Polling Cadence Confirmation**: `useAlerts.js` itself contains **0** `setInterval` timers ([useAlerts.js:L1-L227](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js#L1-L227)). Polling cadence is governed per page:
  - **`DashboardPage.jsx`**: `BASE_POLL_INTERVAL = 20000` (**20 seconds**) ([DashboardPage.jsx:L34](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L34)), with exponential backoff on failure capped at 60s, pausing after 5 consecutive errors ([L35](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L35), [L85-L103](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L85-L103)).
  - **`AlertsPage.jsx`**: `30000` ms (**30 seconds**) ([AlertsPage.jsx:L49](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/AlertsPage.jsx#L49)).
  - **`StatisticsPage.jsx`**: `30000` ms (**30 seconds**) ([StatisticsPage.jsx:L43](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/StatisticsPage.jsx#L43)).

### 3.3 `api/client.js`
- **Base URL Config**: `import.meta.env.VITE_API_URL || 'http://localhost:8000'` ([client.js:L4](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/api/client.js#L4)).
- **Interceptors**:
  - Request: Attaches `Authorization: Bearer <token>` dynamically via registered `tokenGetter` ([client.js:L20-L31](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/api/client.js#L20-L31)).
  - Response: Dispatches global `auth-unauthorized` window event when HTTP status is 401 ([client.js:L33-L41](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/api/client.js#L33-L41)).

### 3.4 Multi-Variant Fallback Field Name Audit
**Found Multi-Variant Fallbacks**: YES. Fallback logic checking multiple field name variants remains in [useAlerts.js](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/hooks/useAlerts.js):
1. `useAlerts.js:L6`: `raw.attack || raw.detector || raw.title`
2. `useAlerts.js:L7`: `raw.source_ip || raw.sourceIp || raw.ip`
3. `useAlerts.js:L8`: `raw.threat_score ?? raw.threatScore ?? raw.score`
4. `useAlerts.js:L10`: `raw.technique || raw.mitreTechnique`
5. `useAlerts.js:L11`: `raw.username || raw.user_account || raw.userAccount`
6. `useAlerts.js:L12`: `raw.destination_ip || raw.destination || raw.target`
7. `useAlerts.js:L39`: `raw.timestamp || raw.created_at`
8. `useAlerts.js:L101`: `data.totalAlerts ?? data.total_alerts`
9. `useAlerts.js:L107`: `data.detectionAccuracy ?? data.detection_accuracy`
10. `useAlerts.js:L108-L109`: `data.attackVectorDistribution || data.attack_distribution`
11. `useAlerts.js:L114-L115`: `data.topMaliciousIps || data.top_malicious_ips`

---

## 4. DESIGN SYSTEM CONSISTENCY

- **Color System & Typography**: ✅ All pages strictly adhere to the flat dark theme palette (`#0d1117` background, `#161b22` cards, `#22262f` / `#30363d` borders, `#58a6ff` cyan/blue accent) with font-split (`font-sans` Inter for headings, `font-mono` JetBrains Mono for IPs, timestamps, scores, and technical values). No leftover default Tailwind bright colors or drop-shadow glows were found.
- **Placeholder / Default Copy Audit**:
  - `AttackTypeChart.jsx:L15`: Default parameter fallback value `totalAlerts = 1284` ([AttackTypeChart.jsx:L15](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AttackTypeChart.jsx#L15)).
  - `AuthContext.jsx:L6-L13`: `DEFAULT_OPERATOR` fallback user object (`analyst@socvigil.net`) when localStorage is unpopulated ([AuthContext.jsx:L6-L13](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L6-L13)).
  - `LoginPage.jsx:L85-L86`: Default fallback strings `'analyst.google@socvigil.net'` and `'Google Analyst'` in Google Dev Sandbox handler ([LoginPage.jsx:L85-L86](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx#L85-L86)).

---

## 5. KNOWN OPEN ISSUES STATUS

### 5.1 Dashboard Polling / Retry-Loop Bug
- **Current Status**: ✅ Resolved / Controlled.
- **Literal Code Implementation**:
  - Base poll interval is `BASE_POLL_INTERVAL = 20000` (20 seconds) ([DashboardPage.jsx:L34](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L34)).
  - Overlapping requests are blocked by `isFetchingRef.current` guard ([DashboardPage.jsx:L39](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L39)) and previous in-flight requests are aborted via `AbortController` ([DashboardPage.jsx:L45-L49](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L45-L49)).
  - Exponential backoff on failure: `delay = Math.min(BASE_POLL_INTERVAL * Math.pow(1.5, consecutiveErrors), 60000)` ([DashboardPage.jsx:L95](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L95)).
  - Polling pauses after `MAX_CONSECUTIVE_ERRORS = 5` failures ([DashboardPage.jsx:L35](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L35), [L73-L75](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L73-L75)) and renders a persistent inline error banner ([DashboardPage.jsx:L206-L219](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L206-L219)).

### 5.2 Stacked Duplicate Error Toast Bug
- **Current Status**: ✅ Resolved.
- **Literal Code Implementation**: `DashboardPage.jsx` suppresses automatic toast error popups during automated background polling ([DashboardPage.jsx:L68-L71](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L68-L71)), displaying a single inline banner instead ([DashboardPage.jsx:L206-L219](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/DashboardPage.jsx#L206-L219)). Toast popups trigger only on explicit user actions.

### 5.3 Password Reset Email Delivery
- **Current Status**: ✅ Dev-only Console Stub (as intended).
- **Literal Code Implementation**: Backend logs the password reset token URL to the developer terminal ([backend/auth/auth.py](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/backend/auth/auth.py)). `AuthContext.forgotPassword` calls `/auth/forgot-password` ([AuthContext.jsx:L136](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx#L136)) and displays confirmation copy without attempting real SMTP transmission.

---

## 6. GAPS AND UNIMPLEMENTED FEATURES

### 6.1 Unimplemented / Missing Feature List
1. ❌ Rate limiting counter / cooldown timer on UI for forgot-password requests (no timer in [LoginPage.jsx](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/pages/LoginPage.jsx)).
2. ❌ Automatic Google account auto-linking prompt UI when same email is registered via local password (no prompt step in [AuthContext.jsx](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/context/AuthContext.jsx)).
3. ❌ Collapsible sidebar drawer toggle for mobile screens (sidebar is hidden via `hidden md:flex` and replaced by bottom nav bar in [Sidebar.jsx:L23](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Sidebar.jsx#L23), [L83](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/layout/Sidebar.jsx#L83)).
4. ❌ Interactive Legend toggling on `AlertsOverTimeChart.jsx` (legend display set to `false` in [AlertsOverTimeChart.jsx:L84](file:///d:/CODE/Projects/AI-Powered%20SOC%20Analytics/AI-SOC-Analytics-Platform/frontend/src/components/charts/AlertsOverTimeChart.jsx#L84)).
5. ❌ Standalone `ForgotPasswordPage.jsx` file (currently embedded inside `LoginPage.jsx`).

### 6.2 Verbatim TODO / FIXME Comments in `frontend/src/`
- **Result**: **0 TODO / FIXME comments** found in `frontend/src/`.
