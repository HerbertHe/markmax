import MarkdownIt from "markdown-it"
import { IRendererOptions } from "../types/renderer"
import { Transformer } from "./tranformer"

// TODO 考虑直接移除 br, 此模式下完全不需要手动换行

// 转化 Markdown-it 的树为 VNode
export const transformMarkdownToVNode = (markdown: string, options: IRendererOptions["markdownit"]) => {
    const md = new MarkdownIt(options)
    const { plugins } = options
    /**
     * 支持 markdown-it 插件
     */
    if (!!plugins && plugins.length > 0) {
        plugins.forEach(plugin => {
            md.use(plugin)
        })
    }

    const parser = md.parse(markdown, {})
    console.log("options", JSON.stringify(options))
    const vnode = new Transformer(parser, options).render()
    // console.log(parser, vnode)
    return vnode
}
