import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { QuickCmds } from './api'
import { ParameterPromptModalComponent } from './components/parameterPromptModal.component'

// Menu and shortcut execution share the same default-on parameter behavior.
export async function sendWithParameters (
    modalService: NgbModal,
    command: QuickCmds,
    send: (command: QuickCmds) => Promise<void>,
): Promise<void> {
    const regex = /\$\{(.*?)\}/g
    const found = command.parseParameters === false ? null : command.text.match(regex)
    if (!found) {
        await send(command)
        return
    }

    const modal = modalService.open(ParameterPromptModalComponent)
    const names = Array.from(new Set(found.map(token => token.slice(2, -1))))
    modal.componentInstance.parameters = names.map(name => ({ name, value: '' }))
    let values: Record<string, string>
    try {
        values = await modal.result
    } catch {
        // Dismissing the parameter prompt cancels execution.
        return
    }
    const text = command.text.replace(regex, (token, name) =>
        Object.prototype.hasOwnProperty.call(values, name) ? values[name] : token)
    await send({ ...command, text })
}
