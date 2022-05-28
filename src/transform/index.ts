import MarkdownIt from "markdown-it"
import { Transformer } from "./tranformer"

// TODO 考虑直接移除 br, 此模式下完全不需要手动换行
// BUG html 会被当做字符串处理

// 转化 Markdown-it 的树为 VNode
export const transformMarkdownToVNode = (markdown: string) => {
    // BUG 修复不渲染 HTML 的问题
    const parser = new MarkdownIt().parse(markdown, {})
    const vnode = new Transformer(parser).render()
    console.log(parser, vnode)
    return vnode
}
