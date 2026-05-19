import { Component } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService, ProfilesService } from 'tabby-core'
import { QuickCmds, ICmdGroup, QuickCmdsGroupScope, SSHProfileOption } from '../api'
import { EditCommandModalComponent } from './editCommandModal.component'
import { EditGroupModalComponent } from './editGroupModal.component'

@Component({
    template: require('./quickCmdsSettingsTab.component.pug'),
    styles: [require('./quickCmdsSettingsTab.component.scss')],
})
export class QuickCmdsSettingsTabComponent {
    quickCmd: string
    commands: QuickCmds[]
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}
    profiles: SSHProfileOption[] = []

    constructor (
        public config: ConfigService,
        private ngbModal: NgbModal,
        private profilesService: ProfilesService,
    ) {
        this.commands = this.config.store.qc.cmds
        this.config.store.qc.groups = this.config.store.qc.groups ?? []
        this.refresh()
        this.loadProfiles()
    }

    async loadProfiles () {
        const profiles = await this.profilesService.getProfiles()
        this.profiles = profiles
            .filter(profile => profile.type === 'ssh' && !!profile.id)
            .map(profile => ({
                id: profile.id,
                name: profile.name,
                description: this.describeProfile(profile),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
    }

    createCommand () {
        let command: QuickCmds = {
            name: '',
            text: '',
            appendCR: true,
            profileIds: [],
        }

        let modal = this.ngbModal.open(EditCommandModalComponent)
        modal.componentInstance.command = command
        modal.componentInstance.allGroups = Array.from(new Set(this.commands.map(x => x.group || ''))).filter(x => x)
        modal.componentInstance.profiles = this.profiles

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
        modal.componentInstance.profiles = this.profiles
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
        const modal = this.ngbModal.open(EditGroupModalComponent)
        modal.componentInstance.group = { name: group.name, cmds: group.cmds, profileIds: group.profileIds ?? [] }
        modal.componentInstance.profiles = this.profiles
        modal.result.then(result => {
            if (!result?.name) {
                return
            }

            const oldName = group.name
            for (let command of this.commands.filter(x => x.group === oldName)) {
                command.group = result.name
            }
            this.upsertGroupScope(result.name, result.profileIds ?? [])
            if (oldName !== result.name) {
                this.removeGroupScope(oldName)
            }
            this.config.save()
            this.refresh()
        })
    }

    deleteGroup (group: ICmdGroup) {
        if (confirm(`Delete "${group}"?`)) {
            for (let command of this.commands.filter(x => x.group === group.name)) {
                command.group = null
            }
            this.removeGroupScope(group.name)
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
                    profileIds: this.getGroupScope(cmd.group).profileIds ?? [],
                }
                this.childGroups.push(group)
            }
            group.cmds.push(cmd)
        }
    }

    private getGroupScope (name: string): QuickCmdsGroupScope {
        return (this.config.store.qc.groups ?? []).find(x => x.name === name) ?? { name, profileIds: [] }
    }

    private upsertGroupScope (name: string, profileIds: string[]) {
        const groups = this.config.store.qc.groups ?? []
        const existing = groups.find(x => x.name === name)
        if (existing) {
            existing.profileIds = profileIds
        } else {
            groups.push({ name, profileIds })
        }
        this.config.store.qc.groups = groups.filter(x => x.name || (x.profileIds ?? []).length)
    }

    private removeGroupScope (name: string) {
        this.config.store.qc.groups = (this.config.store.qc.groups ?? []).filter(x => x.name !== name)
    }

    private describeProfile (profile: any): string {
        const host = profile.options?.host
        const user = profile.options?.user
        const port = profile.options?.port

        if (!host) {
            return profile.id
        }

        return `${user ? `${user}@` : ''}${host}${port ? `:${port}` : ''}`
    }
   
}
