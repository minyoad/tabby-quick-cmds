import { Component, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ICmdGroup, SSHProfileOption } from '../api'

@Component({
    template: `
        <div class="modal-body">
            <div class="form-group">
                <label>Name</label>
                <input class="form-control" type="text" autofocus [(ngModel)]="group.name">
            </div>
            <div class="form-group mt-3">
                <label>SSH profiles</label>
                <div class="form-text text-muted mb-2">Leave empty to show this group in every terminal tab.</div>
                <div class="list-group ssh-profile-list">
                    <label class="list-group-item d-flex align-items-center" *ngFor="let profile of profiles">
                        <input class="form-check-input me-2" type="checkbox" [checked]="isSelected(profile.id)" (change)="toggleProfile(profile.id)">
                        <span class="me-auto">{{ profile.name }}</span>
                        <small class="text-muted">{{ profile.description }}</small>
                    </label>
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

    constructor (
        private modalInstance: NgbActiveModal,
    ) {
    }

    isSelected (profileId: string): boolean {
        return (this.group.profileIds ?? []).includes(profileId)
    }

    toggleProfile (profileId: string) {
        const ids = new Set(this.group.profileIds ?? [])
        ids.has(profileId) ? ids.delete(profileId) : ids.add(profileId)
        this.group.profileIds = Array.from(ids)
    }

    save () {
        this.modalInstance.close(this.group)
    }

    cancel () {
        this.modalInstance.dismiss()
    }
}
