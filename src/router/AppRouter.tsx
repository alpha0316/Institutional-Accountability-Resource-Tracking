import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, roleHomeRoute } from '../store/authStore'
import { DashboardLayout } from '../components/layout/DashboardLayout'

// Auth
import LoginPage from '../portals/school-admin/pages/LoginPage'

// Scanner kiosk
import ScannerPage from '../portals/scanner/ScannerPage'

// Supplier portal
import SupplierLayout       from '../portals/supplier/layout/SupplierLayout'
import SupplierOverview     from '../portals/supplier/pages/Overview'
import TokenInbox           from '../portals/supplier/pages/TokenInbox'
import ReorderMonitor       from '../portals/supplier/pages/ReorderMonitor'
import DeliveryLogger       from '../portals/supplier/pages/DeliveryLogger'
import SubmitToBank         from '../portals/supplier/pages/SubmitToBank'
import SupplierTransactions from '../portals/supplier/pages/TransactionHistory'

// Bank portal
import BankLayout      from '../portals/bank/layout/BankLayout'
import BankOverview    from '../portals/bank/pages/Overview'
import PendingTokens   from '../portals/bank/pages/PendingTokens'
import ValidateToken   from '../portals/bank/pages/ValidateToken'
import CashRelease     from '../portals/bank/pages/CashRelease'
import TransactionLog  from '../portals/bank/pages/TransactionLog'
import AuditReport     from '../portals/bank/pages/AuditReport'
import RejectedTokens  from '../portals/bank/pages/RejectedTokens'

// Government portal
import GovLayout       from '../portals/gov/layout/GovLayout'
import GovOverview     from '../portals/gov/pages/Overview'
import AttendanceReview from '../portals/gov/pages/AttendanceReview'
import BudgetCalculator from '../portals/gov/pages/BudgetCalculator'
import IssueTokens     from '../portals/gov/pages/IssueTokens'
import TokenLedger     from '../portals/gov/pages/TokenLedger'
import Reimbursements  from '../portals/gov/pages/Reimbursements'
import FraudReports    from '../portals/gov/pages/FraudReports'

// Admin portal pages
import Dashboard       from '../portals/school-admin/pages/Dashboard'
import StudentRegistry from '../portals/school-admin/pages/StudentRegistry'
import CardManagement  from '../portals/school-admin/pages/CardManagement'
import DiningHallFeed  from '../portals/school-admin/pages/DiningHallFeed'
import SupplyLogger    from '../portals/school-admin/pages/SupplyLogger'
import FraudAlerts     from '../portals/school-admin/pages/FraudAlerts'
import MealReports     from '../portals/school-admin/pages/MealReports'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user) return <Navigate to={roleHomeRoute[user.role]} replace />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* public */}
        <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/scanner" element={<ScannerPage />} />

        {/* admin portal — nested under sidebar layout */}
        <Route
          path="/admin"
          element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
        >
          <Route index                  element={<Dashboard />} />
          <Route path="students"        element={<StudentRegistry />} />
          <Route path="cards"           element={<CardManagement />} />
          <Route path="feed"            element={<DiningHallFeed />} />
          <Route path="supply"          element={<SupplyLogger />} />
          <Route path="fraud"           element={<FraudAlerts />} />
          <Route path="reports"         element={<MealReports />} />
        </Route>

        {/* Government portal */}
        <Route path="/gov" element={<PrivateRoute><GovLayout /></PrivateRoute>}>
          <Route index                    element={<GovOverview />} />
          <Route path="attendance"        element={<AttendanceReview />} />
          <Route path="budget"            element={<BudgetCalculator />} />
          <Route path="tokens/issue"      element={<IssueTokens />} />
          <Route path="tokens/ledger"     element={<TokenLedger />} />
          <Route path="reimbursements"    element={<Reimbursements />} />
          <Route path="fraud"             element={<FraudReports />} />
        </Route>

        {/* Supplier portal */}
        <Route path="/supplier" element={<PrivateRoute><SupplierLayout /></PrivateRoute>}>
          <Route index                    element={<SupplierOverview />} />
          <Route path="tokens"            element={<TokenInbox />} />
          <Route path="reorder"           element={<ReorderMonitor />} />
          <Route path="deliveries"        element={<DeliveryLogger />} />
          <Route path="submit-bank"       element={<SubmitToBank />} />
          <Route path="transactions"      element={<SupplierTransactions />} />
        </Route>

        {/* Bank portal */}
        <Route path="/bank" element={<PrivateRoute><BankLayout /></PrivateRoute>}>
          <Route index                    element={<BankOverview />} />
          <Route path="pending"           element={<PendingTokens />} />
          <Route path="validate"          element={<ValidateToken />} />
          <Route path="cash-release"      element={<CashRelease />} />
          <Route path="transactions"      element={<TransactionLog />} />
          <Route path="audit"             element={<AuditReport />} />
          <Route path="rejected"          element={<RejectedTokens />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
