import { m, VElement } from "million"
import Token from "markdown-it/lib/token"

import { ResultNode, RuleCallbackType } from "../types/rules"
import { unescapeAll } from "markdown-it/lib/common/utils"
import { IRendererOptions } from "../types/renderer"
import { fromHTMLStringToVNode } from "../utils/fromHTMLStringToVNode"
import { generateHTMLTagCloseVNode, generateHTMLTagOpenVNode, isHTMLClose, isHTMLOpen } from "../utils/html"

import { HighlightPlugin } from "../plugins/highlight"

declare class Transformer {
    renderInlineAsText(children: Token[]): string
    renderToken(tokens: Token[], idx: number): ResultNode
    renderAttrs(token: Token | Record<string, any>): Record<string, string>
}

export const Rules: Record<string, RuleCallbackType> = {
    code_inline: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const token = tokens[idx]
        return [m(
            "code",
            {
                ...slf.renderAttrs(token),
                nesting: token.nesting,
            },
            [token.content]
        )]
    },

    code_block: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const token = tokens[idx]
        return [m(
            "pre",
            {
                ...slf.renderAttrs(token),
                nesting: token.nesting,
            },
            [m("code", {
                nesting: token.nesting,
            }, [token.content])]
        )]
    },

    fence: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const token = tokens[idx]
        const info = token.info ? unescapeAll(token.info).trim() : ""
        let langName = ""
        let langAttrs = ""

        if (info) {
            let arr = info.split(/\s+/)
            langName = arr[0]
            langAttrs = arr.slice(2).join("")
        }

        // TODO 改成插件化，暂时使用 highlight.js 来进行直接处理
        /**
         * @link https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js#L52
         */
        let highlighted = fromHTMLStringToVNode(HighlightPlugin(token.content))

        if (info) {
            let i = token.attrIndex("class")
            let tmpAttrs = token.attrs ? token.attrs.slice() : []

            if (i < 0) {
                tmpAttrs.push(["class", "language-" + langName])
            } else {
                tmpAttrs[i] = tmpAttrs[i].slice() as [string, string]
                tmpAttrs[i][1] += " language-" + langName
            }

            return [
                m(
                    "pre",
                    {
                        nesting: token.nesting,
                    },
                    [
                        m(
                            "code",
                            {
                                nesting: token.nesting,
                                ...slf.renderAttrs({
                                    attrs: tmpAttrs,
                                }),
                            },
                            highlighted
                        )
                    ]
                )
            ]
        }

        // 保守输出
        return [
            m(
                "pre",
                {
                    ...slf.renderAttrs(token),
                    nesting: token.nesting,
                },
                [m(
                    "code",
                    {
                        nesting: token.nesting,
                    },
                    highlighted
                )]
            )
        ]
    },

    image: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const token = tokens[idx]
        token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children)
        return slf.renderToken(tokens, idx)
    },

    hardbreak: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        return [m("br", {})]
    },

    softbreak: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const { breaks } = options
        return breaks ? [m("br", {})] : `\n`
    },

    text: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const { content } = tokens[idx]

        /**
         * TODO: 可能会导致的问题
         * @link https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js#L117
         */
        return content
    },

    html_block: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const { html } = options
        if (html) {
            const node = fromHTMLStringToVNode(tokens[idx].content.replace(/\n/g, ""))[0] as VElement
            node.props = {
                nesting: 0
            }
            return node
        }
        return tokens[idx].content
    },

    html_inline: (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => {
        const { content } = tokens[idx]
        const { html } = options
        if (html && isHTMLOpen(content)) {
            return generateHTMLTagOpenVNode(content)
        }

        if (html && isHTMLClose) {
            return generateHTMLTagCloseVNode(content)
        }

        return tokens[idx].content
    }
}
