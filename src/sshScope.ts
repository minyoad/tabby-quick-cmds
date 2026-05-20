import { BaseTabComponent, SplitTabComponent } from 'tabby-core'
import { QuickCmds, ICmdGroup, SSHProfileOption } from './api'

export interface RuntimeSSHContext {
    profileId: string | null
    isSSH: boolean
}

export function getFocusedTab (tab: BaseTabComponent | null): BaseTabComponent | null {
    if (!tab) {
        return null
    }
    if (tab instanceof SplitTabComponent) {
        return tab.getFocusedTab()
    }
    return tab
}

export function getRuntimeSSHContext (tab: BaseTabComponent | null): RuntimeSSHContext {
    const focused = getFocusedTab(tab) as any
    const profile = focused?.profile ?? focused?.sshSession?.profile ?? focused?.session?.profile ?? null
    const profileId = typeof profile?.id === 'string' ? profile.id : null
    const isSSH = profile?.type === 'ssh' || (!!profile?.options?.host && !!profile?.options?.user) || String(focused?.constructor?.name ?? '').includes('SSH')

    return { profileId, isSSH }
}

export function scopedToCurrentProfile (profileIds: string[] | undefined, context: RuntimeSSHContext): boolean {
    const ids = (profileIds ?? []).filter(Boolean)
    if (!ids.length) {
        return true
    }
    return context.isSSH && !!context.profileId && ids.includes(context.profileId)
}

export function commandVisibleForContext (
    command: QuickCmds,
    groups: ICmdGroup[],
    context: RuntimeSSHContext,
): boolean {
    const group = groups.find(x => x.name === (command.group || ''))
    return scopedToCurrentProfile(group?.profileIds, context) && scopedToCurrentProfile(command.profileIds, context)
}

export function profileLabel (profile: SSHProfileOption): string {
    return profile.description ? `${profile.name} (${profile.description})` : profile.name
}

export function profileMatchesQuery (profile: SSHProfileOption, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
        return true
    }

    return [
        profile.id,
        profile.name,
        profile.description,
    ].some(value => (value ?? '').toLowerCase().includes(normalizedQuery))
}
