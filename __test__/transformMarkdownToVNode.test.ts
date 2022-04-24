import fs from "fs"
import path from "path"
import { transformMarkdownToVNode } from "../src/transform/index"

const __dirname = path.resolve()

test('transformMarkdownToNode', () => {
    const markdown = fs.readFileSync(path.join(__dirname, "__test__/test.md")).toString()
    const vnode = transformMarkdownToVNode(markdown)
    // fs.writeFileSync(path.join(__dirname, "__test__/tmp/vnode.json"), JSON.stringify(vnode))
    expect(true).toBe(true)
})
