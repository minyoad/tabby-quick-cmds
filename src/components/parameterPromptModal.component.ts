import { Component, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
    template: require('./parameterPromptModal.component.pug'),
})
export class ParameterPromptModalComponent {
    @Input() parameters: { name: string, value: string }[] = []

    constructor (
        private modalInstance: NgbActiveModal,
    ) { }

    save () {
        const values: { [key: string]: string } = {}
        for (const param of this.parameters) {
            values[param.name] = param.value
        }
        this.modalInstance.close(values)
    }

    cancel () {
        this.modalInstance.dismiss()
    }
}
