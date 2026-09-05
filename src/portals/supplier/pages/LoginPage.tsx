import { PortalLoginScreen } from '../../../components/auth/PortalLoginScreen'

export default function LoginPage() {
  return (
    <PortalLoginScreen
      theme="emerald"
      icon="truck-delivery"
      portalName="Supplier"
      tagline="Track tokens & manage deliveries"
      roles={[{ role: 'supplier', label: 'Supplier' }]}
    />
  )
}
