const assert = require('assert').strict
const fs = require('fs')
const path = require('path')
const pug = require('pug')
const ts = require('typescript')

async function main () {
    const { parseTemplate } = await import('@angular/compiler')
    // Prove this check catches the reported regression, which Pug and webpack accept.
    assert.ok(parseTemplate('<div>${arr[@]}</div>', 'regression.html').errors?.length)
    const directory = path.join(__dirname, '..', 'src/components')
    let count = 0
    function check (html, name) {
        const result = parseTemplate(html, name)
        assert.equal(result.errors, null, `${name}: ${result.errors?.map(String).join('\n')}`)
        count++
    }
    for (const file of fs.readdirSync(directory)) {
        const filename = path.join(directory, file)
        if (file.endsWith('.pug')) check(pug.renderFile(filename), file)
        if (file.endsWith('.ts')) {
            const source = ts.createSourceFile(file, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true)
            function visit (node) {
                if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'template' &&
                    (ts.isNoSubstitutionTemplateLiteral(node.initializer) || ts.isStringLiteral(node.initializer))) {
                    check(node.initializer.text, file)
                }
                ts.forEachChild(node, visit)
            }
            visit(source)
        }
    }
    console.log(`${count} Angular templates parsed successfully`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
