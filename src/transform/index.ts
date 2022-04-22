import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token"
import { Flags, VElement, VNode } from "million"
import { escapeHTML } from "../utils"

// TODO 类型兼容处理
type RuleCallback = (tokens: Token[], idx: number, slf: Transformer) => VNode[] | VNode

const Rules: Record<string, RuleCallback> = {
    code_inline: (tokens: Token[], idx: number, slf: Transformer) => {
        const token = tokens[idx]
        return {
            tag: "code",
            props: slf.renderAttrs(token),
            children: [escapeHTML(token.content)],
            flag: Flags.ELEMENT_TEXT_CHILDREN
        }
    },

    code_block: (tokens: Token[], idx: number, slf: Transformer) => {
        const token = tokens[idx]
        return {
            tag: "pre",
            props: slf.renderAttrs(token),
            children: [{
                tag: "code",
                children: [escapeHTML(token.content)],
                flag: Flags.ELEMENT_TEXT_CHILDREN
            }],
            flag: Flags.ELEMENT
        }
    },

    // fence: (tokens: Token[], idx: number, slf: Transformer) => {
    //     // TODO 围栏处理
    // },

    image: (tokens: Token[], idx: number, slf: Transformer) => {
        const token = tokens[idx]
        token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children)
        return slf.renderToken(tokens, idx)
    },

    // TODO hardbreak
    // TODO softbreak
    text: (tokens: Token[], idx: number, slf: Transformer) => {
        return tokens[idx].content
    },

    html_block: (tokens: Token[], idx: number, slf: Transformer) => {
        return tokens[idx].content
    },

    html_inline: (tokens: Token[], idx: number, slf: Transformer) => {
        return tokens[idx].content
    }
}

class Transformer {
    private _tokens: Token[] = []

    constructor(tokens: Token[]) {
        this._tokens = tokens
    }

    renderAttrs(token: Token) {
        let result: Record<string, string> = {}

        const { attrs } = token
        if (!token.attrs) {
            return null
        }

        for (let i = 0; i < attrs.length; i++) {
            const [key, value] = attrs[i]
            result[escapeHTML(key)] = escapeHTML(value)
        }

        return result
    }

    renderInlineAsText(tokens: Token[]) {
        let result = ""
        for (let i = 0; i < tokens.length; i++) {
            const { type, children, content } = tokens[i]
            if (type === "text") {
                result += content
            } else if (type === "image") {
                result += this.renderInlineAsText(children)
            } else if (type === "softbreak") {
                // 软换行
                result += `\n`
            }
        }

        return result
    }

    renderToken(tokens: Token[], idx: number): VNode[] {
        // TODO
        let nextToken
        let result: VNode[] = []
        let needLf = false
        let { tag, block, nesting, hidden } = tokens[idx]
        let LFel: VElement = {
            tag: "br",
            flag: Flags.ELEMENT_NO_CHILDREN
        }

        // hidden
        // TODO 处理不渲染的情况
        // 返回空, 但是我们还是需要处理一下
        if (hidden) {
            return []
        }

        // 插入必要的语法修正换行
        if (block && nesting !== -1 && idx && tokens[idx - 1].hidden) {
            result.push(LFel)
        }

        let el: VElement
        el.tag = tag

        const attrs = this.renderAttrs(tokens[idx])
        if (attrs) {
            el.props = attrs
        }

        if (block) {
            // needLf, 插入换行符号
            needLf = true

            if (nesting === 1) {
                if (idx + 1 < tokens.length) {
                    // 获取下一个 token
                    nextToken = tokens[idx + 1]

                    if (nextToken.type === "inline" || nextToken.hidden) {
                        needLf = false
                    } else if (nextToken.nesting === -1 && nextToken.tag === tag) {
                        needLf = false
                    }
                }
            }
        }

        // result 闭合标签
        result.push(el)

        if (needLf) {
            result.push(LFel)
        }

        return result
    }

    private _renderInline(tokens: Token[]): VNode {
        let result: VNode[] = []
        for (let i = 0; i < tokens.length; i++) {
            // 暂时不考虑兼容 rules
            // TODO 渲染 token
        }
    }

    // TODO 设计 rules 进行兼容
    /**
     * 入口方法
     * 1. 仅关注于 tokens
     */
    render() {
        // BUG 下面的类型定义可能存在错误
        let result: VNode[] = []
        for (let i = 0; i < this._tokens.length; i++) {
            const { type, children } = this._tokens[i]
            if (type === "inline") {
                // 渲染 inline 的子项
                result.push(this._renderInline(children))
            } else {
                // 渲染 Token
            }
        }
    }
}

// 转化 Markdown-it 的树为 VNode
export const transformMarkdownToVNode = (markdown: string) => {
    const parser = new MarkdownIt().parse(markdown, {})
    const vnode = transformer(parser)
    return vnode
}

/**
 * Markdown it renderer 源码映射
 * 1. 判断类型是否是 inline
 * 2. 判断 rules 里面是否有自定义规则
 * 3. 处理普通 token 的情况
 */
