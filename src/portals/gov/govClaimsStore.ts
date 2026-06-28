import { create } from 'zustand'
import { MOCK_GOV_CLAIMS, type GovSemesterClaim, type GovWorkflowStage } from '../../lib/mockData'
import { stageRoleMap, type GovRole } from './GovRoleContext'

/**
 * Mirrors the backend ClaimController's action semantics exactly (same stage map, same
 * log text, same guards) so this can be swapped for real API calls later with no logic change.
 */
const NEXT_STAGE: Partial<Record<GovWorkflowStage, GovWorkflowStage>> = {
  regional: 'financial',
  financial: 'audit',
  audit: 'budget',
}

function officerLabel(role: GovRole): string {
  return role.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function canAct(claim: GovSemesterClaim, role: GovRole): boolean {
  return !claim.frozen && !claim.rejected && claim.stage !== 'closed' && stageRoleMap[claim.stage] === role
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function appendLog(claim: GovSemesterClaim, action: string, role: GovRole): GovSemesterClaim {
  return {
    ...claim,
    approvalHistory: [...claim.approvalHistory, { date: todayLabel(), action, actor: officerLabel(role) }],
    updatedAt: todayLabel(),
  }
}

interface GovClaimsStore {
  claims: GovSemesterClaim[]
  approve: (claimId: string, role: GovRole) => void
  returnToSchool: (claimId: string, role: GovRole) => void
  reject: (claimId: string, role: GovRole) => void
  escalate: (claimId: string, role: GovRole) => void
  freeze: (claimId: string, role: GovRole) => void
  redeemToken: (claimId: string) => void
  settleToken: (claimId: string) => void
}

function applyToClaim(
  claims: GovSemesterClaim[],
  claimId: string,
  role: GovRole,
  transform: (c: GovSemesterClaim) => GovSemesterClaim
): GovSemesterClaim[] {
  return claims.map(c => (c.id === claimId && canAct(c, role) ? transform(c) : c))
}

export const useGovClaimsStore = create<GovClaimsStore>((set) => ({
  claims: MOCK_GOV_CLAIMS,

  approve: (claimId, role) => set(state => ({
    claims: applyToClaim(state.claims, claimId, role, (c) => {
      const next = NEXT_STAGE[c.stage]
      if (!next) return c
      return appendLog({ ...c, stage: next }, `${officerLabel(role)} Review Approved`, role)
    }),
  })),

  returnToSchool: (claimId, role) => set(state => ({
    claims: applyToClaim(state.claims, claimId, role, (c) =>
      appendLog({ ...c, stage: 'received' }, role === 'financial_officer' ? 'Returned for Recalculation' : 'Returned to School', role)
    ),
  })),

  reject: (claimId, role) => set(state => ({
    claims: applyToClaim(state.claims, claimId, role, (c) =>
      c.stage !== 'audit' ? c : appendLog({ ...c, stage: 'closed', rejected: true }, 'Rejected by Audit & Risk Officer', role)
    ),
  })),

  escalate: (claimId, role) => set(state => ({
    claims: applyToClaim(state.claims, claimId, role, (c) => appendLog(c, `Escalated by ${officerLabel(role)}`, role)),
  })),

  freeze: (claimId, role) => set(state => ({
    claims: applyToClaim(state.claims, claimId, role, (c) =>
      c.stage !== 'audit' ? c : appendLog({ ...c, frozen: true }, 'Claim Frozen', role)
    ),
  })),

  redeemToken: (claimId) => set(state => ({
    claims: state.claims.map(c => {
      if (c.id !== claimId || c.stage !== 'token_generated') return c
      return appendLog({ ...c, stage: 'supplier_redemption' }, 'Supplier Redeemed Token — Awaiting Bank Settlement', 'supplier' as GovRole)
    }),
  })),

  settleToken: (claimId) => set(state => ({
    claims: state.claims.map(c => {
      if (c.id !== claimId || c.stage !== 'supplier_redemption') return c
      return appendLog({ ...c, stage: 'closed' }, 'Bank Settlement — Cash Released', 'bank' as GovRole)
    }),
  })),
}))
