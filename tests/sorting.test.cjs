const assert = require('assert').strict
const fs = require('fs')
const vm = require('vm')
const ts = require('typescript')
const path = require('path')
const source = fs.readFileSync(path.join(__dirname, '../src/components/quickCmdsSettingsTab.component.ts'), 'utf8')
const exportsObject = {}
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText, {
    exports: exportsObject,
    require: () => ({ Component: () => () => {} }),
})
const Component = exportsObject.QuickCmdsSettingsTabComponent
const event = () => ({ preventDefault () {}, stopPropagation () {}, dataTransfer: { setData () {} } })
function fixture () {
    let saves = 0
    const component = Object.create(Component.prototype)
    component.commands = [
        { name: 'a1', group: 'a' }, { name: 'b1', group: 'b' },
        { name: 'a2', group: 'a' }, { name: 'u', group: null },
    ]
    component.config = { store: { qc: { cmds: component.commands, groups: [{ name: 'a', profileIds: ['ssh'] }] } }, save: () => saves++ }
    component.refresh = () => {}
    component.endDrag()
    return { component, saves: () => saves }
}
const names = c => c.commands.map(x => x.name).join(',')
{
    const { component: c, saves } = fixture()
    c.startCommandDrag(event(), c.commands[0]); c.dropCommand(event(), c.commands[2])
    assert.equal(names(c), 'a2,b1,a1,u')
    assert.equal(saves(), 1)
    assert.equal(JSON.parse(JSON.stringify(c.config.store.qc.cmds))[0].name, 'a2')
    c.startCommandDrag(event(), c.commands[2]); c.dropCommand(event(), c.commands[0])
    assert.equal(names(c), 'a1,b1,a2,u')
    assert.equal(c.config.store.qc.groups[0].profileIds[0], 'ssh')
}
{
    const { component: c, saves } = fixture()
    c.startGroupDrag(event(), { name: 'a' }); c.dropGroup(event(), { name: null })
    assert.equal(names(c), 'b1,u,a1,a2')
    c.startGroupDrag(event(), { name: null }); c.dropGroup(event(), { name: 'b' })
    assert.equal(names(c), 'u,b1,a1,a2')
    assert.equal(saves(), 2)
}
{
    const { component: c, saves } = fixture()
    c.startCommandDrag(event(), c.commands[0]); c.dropCommand(event(), c.commands[1])
    assert.equal(names(c), 'a1,b1,a2,u')
    c.startGroupDrag(event(), { name: 'a' }); c.dropGroup(event(), { name: 'a' })
    c.quickCmd = 'filter'
    c.startGroupDrag(event(), { name: 'a' }); c.dropGroup(event(), { name: 'b' })
    c.startCommandDrag(event(), c.commands[0]); c.dropCommand(event(), c.commands[2])
    assert.equal(saves(), 0)
    assert.equal(names(c), 'a1,b1,a2,u')
    c.quickCmd = ''
    c.startGroupDrag(event(), { name: 'a' }); c.endDrag(); c.dropGroup(event(), { name: 'b' })
    assert.equal(saves(), 0)
}
console.log('Sorting regression tests passed')
