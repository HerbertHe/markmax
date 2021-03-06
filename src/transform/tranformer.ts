import { escapeHtml } from "markdown-it/lib/common/utils"
import Token from "markdown-it/lib/token"
import { m, VElement, VNode } from "million"
import { IRendererOptions } from "../types/renderer"
import { ResultNode, RuleCallbackType } from "../types/rules"
import { Rules } from "./rules"
import { Washer } from "./washer"

export class Transformer {
    private _tokens: Token[] = []
    private _options: IRendererOptions["markdownit"] = null
    private _rules: Record<string, RuleCallbackType> = Rules

    constructor(tokens: Token[], options: IRendererOptions["markdownit"], rules?: Record<string, RuleCallbackType>) {
        this._tokens = tokens
        this._options = options
        if (!!rules) { }
        this._rules = {
            ...Rules,
            ...rules,
        }
    }

    renderAttrs(token: Token | Record<string, any>) {
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
        let result: VNode[] = []
        let needLf = false
        let { tag, block, nesting, hidden } = tokens[idx]

        let LFel: VElement = m("br", {})

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

        let el: VElement = m(
            tag,
            {
                nesting,
            }
        )

        const attrs = this.renderAttrs(tokens[idx])
        if (attrs) {
            el.props = { ...el.props, ...attrs }
        }

        if (block) {
            needLf = true

            if (nesting === 1) {
                if (idx + 1 < tokens.length) {
                    let nextToken = tokens[idx + 1]

                    if (nextToken.type === "inline" || nextToken.hidden) {
                        needLf = false
                    } else if (nextToken.nesting === -1 && nextToken.tag === tag) {
                        needLf = false
                    }
                }
            }
        }

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
            if (this._rules.hasOwnProperty(type)) {
                const tmp = this._rules[type](tokens, i, this._options, this)
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
            } else if (this._rules.hasOwnProperty(type)) {
                const tmp = this._rules[type](this._tokens, i, this._options, this)
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

        return new Washer(result).wash()
    }
}
