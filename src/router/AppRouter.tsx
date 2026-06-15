import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Icon } from '../components/ui/Icon'
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
import SchoolDetail from '../portals/gov/pages/SchoolDetail'
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

function MobileGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 1024)

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isNarrow && !pathname.startsWith('/scanner')) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 24px',
        background: '#f5f6fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: '#e8f0fe', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Icon name="device-desktop" size={36} color="#4ea4ff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 10, lineHeight: 1.3 }}>
          Desktop Only
        </h1>
        <p style={{ fontSize: 15, color: '#666', maxWidth: 300, lineHeight: 1.6, marginBottom: 28 }}>
          The IARTS Dining Hall system is designed for desktop use. Please open it on a laptop or desktop computer for the best experience.
        </p>
        <div style={{
          background: '#fff', border: '1px solid #e5e5e5',
          borderRadius: 14, padding: '16px 20px',
          maxWidth: 300, width: '100%',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Looking for the Scanner?
          </p>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.5 }}>
            The meal validation scanner is mobile-friendly.{' '}
            <a href="/scanner" style={{ color: '#4ea4ff', fontWeight: 600, textDecoration: 'none' }}>
              Open Scanner →
            </a>
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

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
      <MobileGate>
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
          <Route path="schools/:schoolId" element={<SchoolDetail />} />
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
      </MobileGate>
    </BrowserRouter>
  )
}
