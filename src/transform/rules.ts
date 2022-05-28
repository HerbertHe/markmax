import { m } from "million"

import Token from "markdown-it/lib/token"
import { ResultNode, RuleCallbackType } from "../types/rules"
import { escapeHtml, unescapeAll } from "markdown-it/lib/common/utils"

declare class Transformer {
    renderInlineAsText(children: Token[]): string
    renderToken(tokens: Token[], idx: number): ResultNode
    renderAttrs(token: Token | Record<string, any>): Record<string, string>
}

export const Rules: Record<string, RuleCallbackType> = {
    code_inline: (tokens: Token[], idx: number, slf: Transformer) => {
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

    code_block: (tokens: Token[], idx: number, slf: Transformer) => {
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

    fence: (tokens: Token[], idx: number, slf: Transformer) => {
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
        // let highlighted = fromStringToVNode({
        //     type: "code",
        //     content: HighlightPlugin(token.content)
        // })
        let highlighted = token.content

        // TODO 处理高亮之后的代码是否以 pre 开头, 否则添加 \n, 加空行

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
                    [m("code", {
                        ...slf.renderAttrs({ attrs: tmpAttrs }),
                        nesting: token.nesting,
                    },
                        [highlighted]
                    )]
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
                [m("code", {
                    nesting: token.nesting,
                },
                    [highlighted]
                )
                ]
            )
        ]
    },

    image: (tokens: Token[], idx: number, slf: Transformer) => {
        const token = tokens[idx]
        token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children)
        return slf.renderToken(tokens, idx)
    },

    // TODO 考虑移除换行节点
    // TODO 可能的 options
    hardbreak: (tokens: Token[], idx: number, slf: Transformer) => {
        return [m("br", {})]
    },
    // TODO softbreak
    softbreak: (tokens: Token[], idx: number, slf: Transformer) => {
        return [m("br", {})]
    },

    text: (tokens: Token[], idx: number, slf: Transformer) => {
        return escapeHtml(tokens[idx].content)
    },

    html_block: (tokens: Token[], idx: number, slf: Transformer) => {
        return tokens[idx].content
    },

    html_inline: (tokens: Token[], idx: number, slf: Transformer) => {
        return tokens[idx].content
    }
}
