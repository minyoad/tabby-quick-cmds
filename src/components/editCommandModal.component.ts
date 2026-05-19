import { Component, HostListener } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { QuickCmds, SSHProfileOption } from '../api'
import { profileMatchesQuery } from '../sshScope'

@Component({
    template: require('./editCommandModal.component.pug'),
    styles: [`
        .ssh-profile-list {
            max-height: 220px;
            overflow: auto;
        }
    `],
})
export class EditCommandModalComponent {
    allGroups: string[] = []
    profiles: SSHProfileOption[] = []
    command: QuickCmds
    isCapturingShortcut: boolean = false
    sshProfileQuery: string = ''
    specialCommandsInfo: string = 'Special commands:<br> \\x<xx> for control characters, \\s<ms> for delays, ${parameterName} for parameters.'

    constructor (
        private modalInstance: NgbActiveModal,
    ) {
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.isCapturingShortcut) {
            event.preventDefault()
            event.stopPropagation()
            
            // Handle ESC key to cancel capture without changes
            if (event.key === 'Escape') {
                this.isCapturingShortcut = false
                return
            }
            
            // Handle Delete or Backspace to clear the shortcut
            if (event.key === 'Delete' || event.key === 'Backspace') {
                this.command.shortcut = ''
                this.isCapturingShortcut = false
                return
            }
            
            let shortcut = ''
            const modifiers: string[] = []
            
            if (event.ctrlKey || event.metaKey) {
                modifiers.push('Ctrl')
            }
            if (event.altKey) {
                modifiers.push('Alt')
            }
            if (event.shiftKey) {
                modifiers.push('Shift')
            }
            
            // Sort modifiers to ensure consistent ordering
            modifiers.sort()
            
            // Add modifiers to shortcut string
            if (modifiers.length > 0) {
                shortcut = modifiers.join('+') + '+'
            }
            
            // Add the main key
            const mainKey = event.key
            
            // Only process if we have a valid main key (not just modifiers)
            if (mainKey && !['Control', 'Alt', 'Shift', 'Meta'].includes(mainKey)) {
                let processedKey = mainKey
                
                // Handle special cases for keys that need consistent naming
                if (mainKey.length === 1) {
                    // For single character keys, use uppercase
                    processedKey = mainKey.toUpperCase()
                } else {
                    // For special keys (like ArrowUp), use camelCase with first letter uppercase
                    processedKey = mainKey.charAt(0).toUpperCase() + mainKey.slice(1)
                }
                
                shortcut += processedKey
                this.command.shortcut = shortcut
                this.isCapturingShortcut = false
            }
        }
    }

    startCaptureShortcut(event: Event) {
        event.preventDefault()
        this.isCapturingShortcut = true
    }

    get filteredProfiles (): SSHProfileOption[] {
        return this.profiles.filter(profile => profileMatchesQuery(profile, this.sshProfileQuery))
    }

    isProfileSelected (profileId: string): boolean {
        return (this.command.profileIds ?? []).includes(profileId)
    }

    toggleProfile (profileId: string) {
        const ids = new Set(this.command.profileIds ?? [])
        ids.has(profileId) ? ids.delete(profileId) : ids.add(profileId)
        this.command.profileIds = Array.from(ids)
    }

    save () {
        this.command.profileIds = this.command.profileIds ?? []
        this.modalInstance.close(this.command)
    }

    cancel () {
        this.modalInstance.dismiss()
    }
}
