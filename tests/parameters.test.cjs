const assert = require('assert').strict
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const ts = require('typescript')
const pug = require('pug')

// Load the actual component methods without requiring a running Tabby/Angular UI.
function loadComponent (file) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    const output = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2016,
            experimentalDecorators: true,
        },
    }).outputText
    const exports = {}
    const decorator = () => () => {}
    vm.runInNewContext(output, {
        exports,
        require: name => name.endsWith('/parameters') ? loadComponent('src/parameters.ts') : name.endsWith('/visibility') ? loadComponent('src/visibility.ts') : name.endsWith('/sshScope') ? { commandVisibleForContext: () => true, getRuntimeSSHContext: () => ({}) } : name.endsWith('.pug') ? '' : new Proxy({}, {
            get: (_, key) => ['Component', 'HostListener', 'Injectable', 'Input'].includes(key)
                ? decorator : class {},
        }),
    }, { filename: file })
    return exports
}

async function main () {
    const { QuickCmdsModalComponent } = loadComponent('src/components/quickCmdsModal.component.ts')
    const { EditCommandModalComponent } = loadComponent('src/components/editCommandModal.component.ts')
    const { ButtonProvider } = loadComponent('src/buttonProvider.ts')
    const routes = [QuickCmdsModalComponent, ButtonProvider]
    const { EditGroupModalComponent } = loadComponent('src/components/editGroupModal.component.ts')
    const shellCommands = [
        'echo "${arr[@]}"',
        'echo "${name}"',
        'declare -a arr=("/var/log/audit" "/var/log/pods");\nfor i in "${arr[@]}"; do echo "${name}"; done;',
    ]
    let cases = 0
    async function send (route, command, expectedName, cancelled = false) {
        const sent = []
        const tab = {}
        let prompts = 0
        const context = {
            ngbModal: { open () {
                prompts++
                const componentInstance = {}
                return { componentInstance, result: Promise.resolve({ message: 'hello' }).then(values => {
                    if (cancelled) throw new Error('dismissed')
                    assert.equal(componentInstance.parameters.length, 1)
                    assert.equal(componentInstance.parameters[0].name, expectedName)
                    return values
                }) }
            } },
            executeSend: (actualTab, cmd) => { assert.equal(actualTab, tab); sent.push(cmd) },
        }
        await route.prototype._send.call(context, tab, command)
        await Promise.resolve()
        assert.equal(prompts, expectedName ? 1 : 0)
        assert.equal(sent.length, cancelled ? 0 : 1)
        if (cancelled) { cases++; return }
        assert.equal(sent[0].text, expectedName ? 'git commit -m "hello"' : command.text)
        assert.equal(command.text.includes('hello'), false, 'stored command must remain unchanged')
        cases++
    }
    for (const route of routes) {
        for (const text of shellCommands) {
            await send(route, { text, appendCR: true, parseParameters: false })
        }
        for (const parseParameters of [undefined, true]) {
            await send(route, { text: 'git commit -m "${message}"', appendCR: true, parseParameters }, 'message')
        }
        await send(route, { text: 'git commit -m "${message}"', appendCR: true, parseParameters: false })
        await send(route, { text: 'echo plain', appendCR: true })
        await send(route, { text: 'git commit -m "${message}"', appendCR: true }, 'message', true)
    }
    for (const parseParameters of [undefined, true, false]) {
        const command = { text: 'echo "${name}"', appendCR: true, parseParameters }
        const editor = new EditCommandModalComponent({ close: result => {
            const restored = JSON.parse(JSON.stringify(result))
            assert.equal(restored.parseParameters, parseParameters !== false)
        } })
        editor.command = command
        editor.ngOnInit()
        assert.equal(command.parseParameters, parseParameters !== false)
        editor.save()
        cases++
    }
    for (const hidden of [undefined, false, true]) {
        const editor = new EditCommandModalComponent({ close: () => {} })
        editor.command = { name: 'legacy', text: 'echo legacy', appendCR: true, hidden }
        editor.ngOnInit()
        assert.equal(editor.command.hidden, hidden === true)
        const groupEditor = new EditGroupModalComponent({ close: () => {} })
        groupEditor.group = { name: 'legacy', cmds: [], hidden }
        groupEditor.ngOnInit()
        assert.equal(groupEditor.group.hidden, hidden === true)
        cases += 2
    }
    const { commandShownInMenu } = loadComponent('src/visibility.ts')
    for (const hidden of [undefined, true, false]) {
        for (const groupHidden of [undefined, true, false]) {
            assert.equal(commandShownInMenu({ hidden, group: 'tools' }, [{ name: 'tools', hidden: groupHidden }]),
                hidden !== true && groupHidden !== true)
            cases++
        }
    }
    assert.equal(commandShownInMenu({ hidden: false }, []), true)
    assert.equal(commandShownInMenu({ hidden: false }, [{ name: null, hidden: false }]), true)
    assert.equal(commandShownInMenu({ name: 'legacy ungrouped' }, []), true)
    assert.equal(commandShownInMenu({ group: 'legacy' }, [{ name: 'legacy' }]), true)
    cases += 4
    const menu = Object.create(QuickCmdsModalComponent.prototype)
    Object.assign(menu, {
        config: { store: { qc: { groups: [{ name: 'shown', hidden: false }, { name: 'hidden', hidden: true }] } } },
        app: { activeTab: null }, groupCollapsed: {}, usageCount: {}, quickCmd: '',
        cmds: [
            { name: 'visible', text: 'echo visible', group: 'shown', hidden: false },
            { name: 'hidden command', text: 'echo hidden', group: 'shown', hidden: true },
            { name: 'hidden group child', text: 'echo child', group: 'hidden', hidden: false },
        ],
    })
    for (const query of ['', 'echo', 'hidden']) {
        menu.quickCmd = query
        menu.refresh()
        const commands = menu.flattenedItems.filter(item => item.type === 'cmd')
        assert.equal(commands.length, query === 'hidden' ? 0 : 1)
        if (commands.length) assert.equal(commands[0].cmd.name, 'visible')
        cases++
    }
    const { QuickCmdsSettingsTabComponent } = loadComponent('src/components/quickCmdsSettingsTab.component.ts')
    let saves = 0
    const settings = Object.create(QuickCmdsSettingsTabComponent.prototype)
    Object.assign(settings, {
        config: { store: { qc: { groups: [] } }, save: () => saves++ },
        commands: [{ name: 'ungrouped', text: 'echo', hidden: true }],
    })
    settings.refresh()
    assert.equal(settings.childGroups[0].cmds.length, 1, 'settings must include hidden commands')
    settings.setGroupHidden(settings.childGroups[0], false)
    settings.setCommandHidden(settings.commands[0], false)
    const restored = JSON.parse(JSON.stringify(settings.config.store.qc.groups))
    assert.equal(commandShownInMenu(settings.commands[0], restored), true)
    settings.refresh()
    assert.equal(settings.childGroups[0].hidden, false)
    assert.equal(saves, 2)
    cases++
    // Compile the shipped Pug templates and verify the theme-native controls retain their bindings.
    for (const [file, bindings] of [
        ['editCommandModal', ['command.hidden', 'command.parseParameters']],
        ['quickCmdsSettingsTab', ['group.hidden === true', 'cmd.hidden === true']],
    ]) {
        const html = pug.renderFile(path.join(__dirname, '..', 'src/components', `${file}.component.pug`))
        for (const binding of bindings) {
            const controls = html.match(/<toggle[^>]*>/g) || []
            assert.ok(controls.some(control => (control.includes(`[(ngModel)]="${binding}"`) || control.includes(`[ngModel]="${binding}"`))))
            cases++
        }
    }
    const groupSource = fs.readFileSync(path.join(__dirname, '..', 'src/components/editGroupModal.component.ts'), 'utf8')
    assert.ok(groupSource.includes('<toggle [(ngModel)]="group.hidden"></toggle>'))
    cases++
    assert.ok(groupSource.includes('<toggle [(ngModel)]="sshEnabled" (ngModelChange)="onSshToggle()"></toggle>'))
    assert.ok(groupSource.includes('*ngIf="sshEnabled"'))
    for (const profileIds of [undefined, [], ['ssh-one']]) {
        let saved
        const editor = new EditGroupModalComponent({ close: value => { saved = value } })
        editor.group = { name: 'group', cmds: [], profileIds }
        editor.ngOnInit()
        assert.equal(editor.sshEnabled, Boolean(profileIds?.length))
        editor.save()
        assert.equal(JSON.stringify(saved.profileIds), JSON.stringify(profileIds || []))
        editor.sshEnabled = false
        editor.onSshToggle()
        assert.equal(editor.group.profileIds.length, 0)
        editor.sshEnabled = true
        editor.toggleProfile('ssh-two')
        editor.save()
        assert.equal(JSON.stringify(saved.profileIds), JSON.stringify(['ssh-two']))
        cases++
    }
    cases++
    console.log(`${cases} regression cases passed`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
