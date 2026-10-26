export interface QuickCmds {
    name: string
    text: string
    appendCR: boolean
    // Omitted means enabled, preserving existing parameterized commands.
    parseParameters?: boolean
    group?: string
    shortcut?: string
    hidden?: boolean
    profileIds?: string[]
}

export interface ICmdGroup {
    name: string
    cmds: QuickCmds[]
    hidden?: boolean
    profileIds?: string[]
}

export interface QuickCmdsGroupScope {
    name: string
    hidden?: boolean
    profileIds?: string[]
}

export interface SSHProfileOption {
    id: string
    name: string
    description: string
}
