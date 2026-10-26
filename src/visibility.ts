import { QuickCmds, QuickCmdsGroupScope } from './api'

// Hiding affects discovery in the menu, not execution through a saved shortcut.
export function commandShownInMenu (command: QuickCmds, groups: QuickCmdsGroupScope[]): boolean {
    const group = groups.find(item => (item.name || '') === (command.group || ''))
    return command.hidden !== true && group?.hidden !== true
}
