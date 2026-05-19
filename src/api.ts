export interface QuickCmds {
    name: string
    text: string
    appendCR: boolean
    group?: string
    shortcut?: string
    profileIds?: string[]
}

export interface ICmdGroup {
    name: string
    cmds: QuickCmds[]
    profileIds?: string[]
}

export interface QuickCmdsGroupScope {
    name: string
    profileIds?: string[]
}

export interface SSHProfileOption {
    id: string
    name: string
    description: string
}
