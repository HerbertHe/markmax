import MarkdownIt from "markdown-it"
import { escapeHtml, unescapeAll } from "markdown-it/lib/common/utils"
import Token from "markdown-it/lib/token"
import type { VElement, VNode } from "million"

enum Flags {
    ENTITY = 0,
    ELEMENT = 1,
    ELEMENT_IGNORE = 2,
    ELEMENT_SKIP_DIFF = 3,
    ELEMENT_NO_CHILDREN = 4,
    ELEMENT_TEXT_CHILDREN = 5,
    ELEMENT_KEYED_CHILDREN = 6
}

type RuleCallback = (tokens: Token[], idx: number, slf: Transformer) => ResultNode

type ResultNode = VNode | VNode[] | string

const Rules: Record<string, RuleCallback> = {
    code_inline: (tokens: Token[], idx: number, slf: Transformer) => {
        const token = tokens[idx]
        return {
            tag: "code",
            props: slf.renderAttrs(token),
            children: [escapeHtml(token.content)],
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
                children: [escapeHtml(token.content)],
                flag: Flags.ELEMENT_TEXT_CHILDREN
            }],
            flag: Flags.ELEMENT
        }
    },

    fence: (tokens: Token[], idx: number, slf: Transformer) => {
        // TODO 围栏处理
        const token = tokens[idx]
        const info = token.info ? unescapeAll(token.info) : ""
        let langName = ""
        let langAttrs = ""
        let arr

        if (info) {
            arr = info.split(/\s+/)
            langName = arr[0]
            langAttrs = arr.slice(2).join("")
        }

        // TODO 处理 highlight, 添加 options 的支持
        // 不管什么语言生成节点就好
        // 配置项存在则交给高亮函数处理

        // 不存在则返回原样
        // TODO 使用 highlight.js 来处理
        let highlighted = escapeHtml(token.content)

        // 处理高亮之后的代码是否以 pre 开头, 否则添加 \n, 加空行

        // TODO 注入 class

        // 保守输出
        return {
            tag: "pre",
            props: slf.renderAttrs(token),
            children: [{
                tag: "code",
                // TODO 高亮之后的代码内容
                children: [highlighted],
                flag: Flags.ELEMENT
            }],
            flag: Flags.ELEMENT
        }
    },

    image: (tokens: Token[], idx: number, slf: Transformer) => {
        const token = tokens[idx]
        token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children)
        return slf.renderToken(tokens, idx)
    },

    // TODO 可能的 options
    hardbreak: (tokens: Token[], idx: number, slf: Transformer) => {
        return {
            tag: "br",
            flag: Flags.ELEMENT_NO_CHILDREN
        }
    },
    // TODO softbreak
    softbreak: (tokens: Token[], idx: number, slf: Transformer) => {
        return {
            tag: "br",
            flag: Flags.ELEMENT_NO_CHILDREN
        }
    },

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
            result[escapeHtml(key)] = escapeHtml(value)
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

        let el: VElement = {
            tag: tag,
            flag: Flags.ELEMENT
        }

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
                    let nextToken = tokens[idx + 1]

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

    private _renderInline(tokens: Token[]): ResultNode {
        let result: VNode[] = []
        for (let i = 0; i < tokens.length; i++) {
            const { type } = tokens[i]
            if (Rules.hasOwnProperty(type)) {
                const tmp = Rules[type](tokens, i, this)
                if (Array.isArray(tmp)) {
                    result = result.concat(tmp)
                } else {
                    result.push(tmp)
                }
            } else {
                const tmp = this.renderToken(tokens, i)
                if (Array.isArray(tmp)) {
                    result = result.concat(tmp)
                } else {
                    result.push(tmp)
                }
            }
        }

        return result
    }

    // TODO 设计 rules 进行兼容
    render() {
        let result: VNode[] = []
        for (let i = 0; i < this._tokens.length; i++) {
            const { type, children } = this._tokens[i]
            if (type === "inline") {
                const tmp = this._renderInline(children)
                if (Array.isArray(tmp)) {
                    result = result.concat(tmp)
                } else {
                    result.push(tmp)
                }
            } else if (Rules.hasOwnProperty(type)) {
                const tmp = Rules[type](this._tokens, i, this)
                if (Array.isArray(tmp)) {
                    result = result.concat(tmp)
                } else {
                    result.push(tmp)
                }
            } else {
                const tmp = this.renderToken(this._tokens, i)
                if (Array.isArray(tmp)) {
                    result = result.concat(tmp)
                } else {
                    result.push(tmp)
                }
            }
        }
        return result
    }
}

// 转化 Markdown-it 的树为 VNode
export const transformMarkdownToVNode = (markdown: string) => {
    const parser = new MarkdownIt().parse(markdown, {})
    const vnode = new Transformer(parser).render()
    console.log(vnode)
    return vnode
}

/**
 * Markdown it renderer 源码映射
 * 1. 判断类型是否是 inline
 * 2. 判断 rules 里面是否有自定义规则
 * 3. 处理普通 token 的情况
 */
