import { PortalLoginScreen } from '../../../components/auth/PortalLoginScreen'

export default function LoginPage() {
  return (
    <PortalLoginScreen
      theme="violet"
      icon="building-community"
      portalName="Government"
      tagline="Regional, financial & audit oversight"
      roles={[
        { role: 'regional_officer',  label: 'Regional' },
        { role: 'financial_officer', label: 'Financial' },
        { role: 'audit_officer',     label: 'Audit & Risk' },
      ]}
    />
  )
}
