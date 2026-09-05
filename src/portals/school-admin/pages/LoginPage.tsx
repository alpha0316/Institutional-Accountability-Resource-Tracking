import { PortalLoginScreen } from '../../../components/auth/PortalLoginScreen'

export default function LoginPage() {
  return (
    <PortalLoginScreen
      theme="blue"
      icon="shield"
      portalName="School Admin"
      tagline="Manage students & dining hall operations"
      roles={[{ role: 'school_admin', label: 'School Admin' }]}
    />
  )
}
