import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'

import { QuickCmdsSettingsTabComponent } from './components/quickCmdsSettingsTab.component'

@Injectable()
export class QuickCmdsSettingsTabProvider extends SettingsTabProvider {
    id = 'qc'
    title = 'Quick Commands'

    getComponentType (): any {
        return QuickCmdsSettingsTabComponent
    }
}
