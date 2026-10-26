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
    showFullCommand: boolean = true
    private draggedCommand: QuickCmds | null = null
    private draggedGroup: string | null = null

    startCommandDrag (event: DragEvent, command: QuickCmds) {
        this.beginDrag(event)
        if (!this.quickCmd) this.draggedCommand = command
    }

    startGroupDrag (event: DragEvent, group: ICmdGroup) {
        this.beginDrag(event)
        if (!this.quickCmd) this.draggedGroup = group.name || ''
    }

    private beginDrag (event: DragEvent) {
        this.endDrag()
        event.stopPropagation()
        if (this.quickCmd) {
            event.preventDefault()
            return
        }
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', 'quick-command-sort')
        }
    }

    endDrag () {
        this.draggedCommand = null
        this.draggedGroup = null
    }

    allowCommandDrop (event: DragEvent, command: QuickCmds) {
        if (!this.quickCmd && this.draggedCommand &&
            (this.draggedCommand.group || '') === (command.group || '')) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    allowGroupDrop (event: DragEvent) {
        if (!this.quickCmd && this.draggedGroup !== null) event.preventDefault()
    }

    dropCommand (event: DragEvent, target: QuickCmds) {
        event.preventDefault()
        event.stopPropagation()
        const source = this.draggedCommand
        this.endDrag()
        if (this.quickCmd || !source || source === target ||
            (source.group || '') !== (target.group || '')) return
        // Reorder only this group's occupied slots, preserving other groups.
        const slots = this.commands.map((cmd, index) => ({ cmd, index }))
            .filter(item => (item.cmd.group || '') === (target.group || ''))
        const ordered = slots.map(item => item.cmd)
        const from = ordered.indexOf(source)
        const to = ordered.indexOf(target)
        if (from < 0 || to < 0) return
        ordered.splice(from, 1)
        ordered.splice(to, 0, source)
        slots.forEach((item, index) => { this.commands[item.index] = ordered[index] })
        this.saveOrder()
    }

    dropGroup (event: DragEvent, target: ICmdGroup) {
        event.preventDefault()
        event.stopPropagation()
        const source = this.draggedGroup
        this.endDrag()
        if (this.quickCmd || source === null) return
        const names = Array.from(new Set(this.commands.map(cmd => cmd.group || '')))
        const from = names.indexOf(source)
        const to = names.indexOf(target.name || '')
        if (from < 0 || to < 0 || from === to) return
        names.splice(from, 1)
        names.splice(to, 0, source)
        this.commands = names.reduce((all, name) =>
            all.concat(this.commands.filter(cmd => (cmd.group || '') === name)), [] as QuickCmds[])
        this.saveOrder()
    }

    private saveOrder () {
        this.config.store.qc.cmds = this.commands
        this.config.save()
        this.refresh()
    }

    constructor (
        public config: ConfigService,
        private ngbModal: NgbModal,
        private profilesService: ProfilesService,
    ) {
        this.commands = this.config.store.qc.cmds
        this.config.store.qc.groups = this.config.store.qc.groups ?? []
        this.showFullCommand = localStorage.getItem('qcShowFullCommand') !== 'false'
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
        modal.componentInstance.group = { name: group.name, cmds: group.cmds, hidden: group.hidden === true, profileIds: group.profileIds ?? [] }
        modal.componentInstance.profiles = this.profiles
        modal.result.then(result => {
            if (!result?.name) {
                return
            }

            const oldName = group.name
            for (let command of this.commands.filter(x => x.group === oldName)) {
                command.group = result.name
            }
            this.upsertGroupScope(result.name, result.profileIds ?? [], result.hidden === true)
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

    setCommandHidden (command: QuickCmds, hidden: boolean) {
        command.hidden = hidden
        this.config.save()
    }

    setGroupHidden (group: ICmdGroup, hidden: boolean) {
        group.hidden = hidden
        this.upsertGroupScope(group.name, group.profileIds ?? [], hidden)
        this.config.save()
    }

    cancelFilter(){
        this.quickCmd=''
        this.refresh()
    }

    onShowFullCommandChange (value: boolean) {
        const enabled = value !== false
        this.showFullCommand = enabled
        localStorage.setItem('qcShowFullCommand', String(enabled))
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
                    hidden: this.getGroupScope(cmd.group).hidden === true,
                }
                this.childGroups.push(group)
            }
            group.cmds.push(cmd)
        }
    }

    private getGroupScope (name: string): QuickCmdsGroupScope {
        return (this.config.store.qc.groups ?? []).find(x => (x.name || '') === (name || '')) ?? { name, profileIds: [] }
    }

    private upsertGroupScope (name: string, profileIds: string[], hidden: boolean) {
        const groups = this.config.store.qc.groups ?? []
        const existing = groups.find(x => (x.name || '') === (name || ''))
        if (existing) {
            existing.profileIds = profileIds
            existing.hidden = hidden
        } else {
            groups.push({ name, profileIds, hidden })
        }
        this.config.store.qc.groups = groups.filter(x => x.name || x.hidden !== undefined || (x.profileIds ?? []).length)
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
