import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider } from 'tabby-core'

@Injectable()
export class QuickCmdsHotkeyProvider extends HotkeyProvider {
    async provide (): Promise<HotkeyDescription[]> {
        return [{
            id: 'toggle-quick-cmds',
            name: 'Show Quick Commands Menu',
        }]
    }
}
