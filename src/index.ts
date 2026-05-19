import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { ToolbarButtonProvider, ConfigProvider } from 'tabby-core'
import TabbyCoreModule from 'tabby-core'
import { SettingsTabProvider } from 'tabby-settings'

import { EditCommandModalComponent } from './components/editCommandModal.component'
import { QuickCmdsModalComponent } from './components/quickCmdsModal.component'
import { QuickCmdsSettingsTabComponent } from './components/quickCmdsSettingsTab.component'
import { PromptModalComponent } from './components/promptModal.component'
import { ParameterPromptModalComponent } from './components/parameterPromptModal.component'
import { EditGroupModalComponent } from './components/editGroupModal.component'

import { ButtonProvider } from './buttonProvider'
import { QuickCmdsConfigProvider } from './config'
import { QuickCmdsSettingsTabProvider } from './settings'

@NgModule({
    imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        TabbyCoreModule,
    ],
    providers: [
        { provide: ToolbarButtonProvider, useClass: ButtonProvider, multi: true },
        { provide: ConfigProvider, useClass: QuickCmdsConfigProvider, multi: true },
        { provide: SettingsTabProvider, useClass: QuickCmdsSettingsTabProvider, multi: true },
    ],
    declarations: [
        PromptModalComponent,
        EditCommandModalComponent,
        QuickCmdsModalComponent,
        QuickCmdsSettingsTabComponent,
        ParameterPromptModalComponent,
        EditGroupModalComponent,
    ],
    entryComponents: [
        PromptModalComponent,
        EditCommandModalComponent,
        QuickCmdsModalComponent,
        QuickCmdsSettingsTabComponent,
        ParameterPromptModalComponent,
        EditGroupModalComponent,
    ],
})
export default class QuickCmdsModule { }
