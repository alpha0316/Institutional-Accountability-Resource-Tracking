import { PortalLoginScreen } from '../../../components/auth/PortalLoginScreen'

export default function LoginPage() {
  return (
    <PortalLoginScreen
      theme="amber"
      icon="building-bank"
      portalName="Bank"
      tagline="Validate tokens & release cash"
      roles={[{ role: 'bank', label: 'Bank' }]}
    />
  )
}
