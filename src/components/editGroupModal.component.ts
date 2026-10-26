import { Component, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ICmdGroup, SSHProfileOption } from '../api'
import { profileMatchesQuery } from '../sshScope'

@Component({
    template: `
        <div class="modal-body">
            <div class="form-group">
                <label>Name</label>
                <input class="form-control" type="text" autofocus [(ngModel)]="group.name">
            </div>
            <div class="form-line">
                <div class="header">
                    <div class="title">Hidden</div>
                    <div class="description">Hide this group and its commands from the quick selection menu</div>
                </div>
                <toggle [(ngModel)]="group.hidden"></toggle>
            </div>
            <div class="form-line">
                <div class="header">
                    <div class="title">Limit to SSH profiles</div>
                    <div class="description">Only show this group in selected SSH terminal tabs</div>
                </div>
                <toggle [(ngModel)]="sshEnabled" (ngModelChange)="onSshToggle()"></toggle>
            </div>
            <div class="form-group mt-3" *ngIf="sshEnabled">
                <label>SSH profiles</label>
                <div class="form-text text-muted mb-2">Leave empty to show this group in every terminal tab.</div>
                <input class="form-control mb-2" type="text" placeholder="Search SSH profiles" [(ngModel)]="sshProfileQuery">
                <div class="list-group ssh-profile-list">
                    <label class="list-group-item d-flex align-items-center" *ngFor="let profile of filteredProfiles">
                        <input class="form-check-input me-2" type="checkbox" [checked]="isSelected(profile.id)" (change)="toggleProfile(profile.id)">
                        <span class="me-auto">{{ profile.name }}</span>
                        <small class="text-muted">{{ profile.description }}</small>
                    </label>
                    <div class="list-group-item text-muted" *ngIf="!filteredProfiles.length">No matching SSH profiles</div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline-primary" (click)="save()">Save</button>
            <button class="btn btn-outline-danger" (click)="cancel()">Cancel</button>
        </div>
    `,
    styles: [`
        .ssh-profile-list {
            max-height: 220px;
            overflow: auto;
        }
    `],
})
export class EditGroupModalComponent {
    @Input() group: ICmdGroup
    @Input() profiles: SSHProfileOption[] = []
    sshProfileQuery: string = ''
    sshEnabled: boolean = false

    constructor (
        private modalInstance: NgbActiveModal,
    ) {
    }

    ngOnInit () {
        this.group.hidden = this.group.hidden === true
        this.sshEnabled = (this.group.profileIds?.length ?? 0) > 0
    }

    get filteredProfiles (): SSHProfileOption[] {
        return this.profiles.filter(profile => profileMatchesQuery(profile, this.sshProfileQuery))
    }

    isSelected (profileId: string): boolean {
        return (this.group.profileIds ?? []).includes(profileId)
    }

    toggleProfile (profileId: string) {
        const ids = new Set(this.group.profileIds ?? [])
        ids.has(profileId) ? ids.delete(profileId) : ids.add(profileId)
        this.group.profileIds = Array.from(ids)
    }

    onSshToggle () {
        if (!this.sshEnabled) {
            this.group.profileIds = []
        }
    }

    save () {
        if (!this.sshEnabled) {
            this.group.profileIds = []
        }
        this.group.profileIds = this.group.profileIds ?? []
        this.modalInstance.close(this.group)
    }

    cancel () {
        this.modalInstance.dismiss()
    }
}
