import { Component } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService } from 'tabby-core'
import { QuickCmds, ICmdGroup } from '../api'
import { EditCommandModalComponent } from './editCommandModal.component'
import { PromptModalComponent } from './promptModal.component'

@Component({
    template: require('./quickCmdsSettingsTab.component.pug'),
    styles: [require('./quickCmdsSettingsTab.component.scss')],
})
export class QuickCmdsSettingsTabComponent {
    quickCmd: string
    commands: QuickCmds[]
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}

    constructor (
        public config: ConfigService,
        private ngbModal: NgbModal,
    ) {
        this.commands = this.config.store.qc.cmds
        this.refresh()
    }

    createCommand () {
        let command: QuickCmds = {
            name: '',
            text: '',
            appendCR: true,
        }

        let modal = this.ngbModal.open(EditCommandModalComponent)
        modal.componentInstance.command = command
        modal.componentInstance.allGroups = Array.from(new Set(this.commands.map(x => x.group || ''))).filter(x => x)

        modal.result.then(result => {
            this.commands.push(result)
            this.config.store.qc.cmds = this.commands
            this.config.save()
            this.refresh()
        })
    }

    editCommand (command: QuickCmds) {
        let modal = this.ngbModal.open(EditCommandModalComponent)
        // Ensure command.group is an empty string if it's null or undefined
        modal.componentInstance.command = { ...command, group: command.group || 'Ungrouped' }
        modal.componentInstance.allGroups = Array.from(new Set(this.commands.map(x => x.group || ''))).filter(x => x)
        modal.result.then(result => {
            // If the group is 'Ungrouped', set it to null
            if (result.group === 'Ungrouped') {
                result.group = null
            }
            Object.assign(command, result)
            this.config.save()
            this.refresh()
        })
    }

    deleteCommand (command: QuickCmds) {
        if (confirm(`Delete "${command.name}"?`)) {
            this.commands = this.commands.filter(x => x !== command)
            this.config.store.qc.cmds = this.commands
            this.config.save()
            this.refresh()
        }
    }

    editGroup (group: ICmdGroup) {
        let modal = this.ngbModal.open(PromptModalComponent)
        modal.componentInstance.prompt = 'New group name'
        modal.componentInstance.value = group.name
        modal.result.then(result => {
            if (result) {
                for (let connection of this.commands.filter(x => x.group === group.name)) {
                    connection.group = result
                }
                this.config.save()
                this.refresh()
            }
        })
    }

    deleteGroup (group: ICmdGroup) {
        if (confirm(`Delete "${group}"?`)) {
            for (let command of this.commands.filter(x => x.group === group.name)) {
                command.group = null
            }
            this.config.save()
            this.refresh()
        }
    }

    cancelFilter(){
        this.quickCmd=''
        this.refresh()
    }

    refresh () {
        this.childGroups = []

        let cmds = this.commands
        if (this.quickCmd) {
            cmds = cmds.filter(cmd => (cmd.name + cmd.group + cmd.text).toLowerCase().includes(this.quickCmd))
        }

        for (let cmd of cmds) {
            cmd.group = cmd.group || null
            let group = this.childGroups.find(x => x.name === cmd.group)
            if (!group) {
                group = {
                    name: cmd.group,
                    cmds: [],
                }
                this.childGroups.push(group)
            }
            group.cmds.push(cmd)
        }
    }
   
}