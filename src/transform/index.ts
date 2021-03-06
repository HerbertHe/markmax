import MarkdownIt from "markdown-it"
import { IRendererOptions } from "../types/renderer"
import { Rules } from "./rules"
import { Transformer } from "./tranformer"
import { MarkdownItPluginWrapper } from "./wrapper"

// Tranform markdown-it tree to vnode
export const transformMarkdownToVNode = (markdown: string, options: IRendererOptions["markdownit"]) => {
    const { plugins, warning, ...o } = options
    const md = new MarkdownIt(o)

    /**
     * Support markdown-it plugin
     */
    if (!!plugins && plugins.length > 0) {
        plugins.forEach(plugin => {
            md.use(plugin)
        })
    }

    // TODO 对插件修改 Rules 的情况进行处理，必须达到与 markmax 插件相同的控制，需要在此做些转化
    const { renderer } = md
    const { rules } = renderer

    // TODO 目前仅对不支持的标签进行转换
    const unSupportedRules = Object.keys(rules).filter(key => !Rules.hasOwnProperty(key))

    if (warning) {
        console.warn("Experimental Rules (Support by markdown-it plugin):", unSupportedRules)
    }

    // TODO 通过 wrapper 支持 open/close 标签
    let markdownItRules = {}
    unSupportedRules.forEach(key => {
        markdownItRules[key] = MarkdownItPluginWrapper(rules[key])
    })

    const parser = md.parse(markdown, {})
    const vnode = new Transformer(parser, options, markdownItRules).render()
    return vnode
}
