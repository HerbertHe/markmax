import { escapeHtml } from "markdown-it/lib/common/utils"
import { MarkdownItRenderer, RuleCallbackType } from "../types/rules"
import { generateHTMLTagCloseVNode, generateHTMLTagOpenVNode, generateHTMLTagVNode, isHTML, isHTMLClose, isHTMLOpen } from "../utils/html"

/**
 * markdown-it plugin wrapper
 * @param fn
 * @returns
 */
export const MarkdownItPluginWrapper = (fn: MarkdownItRenderer.MarkdownItRenderRule) => {
    // 转化插件
    return <RuleCallbackType>function (tokens, idx, options, slf) {
        // TODO Don't support argument `env`
        const res = fn(tokens, idx, options, {}, slf)
        /**
         * tranform open tag
         *
         * <a>
         */
        if (isHTMLOpen(res)) {
            return [generateHTMLTagOpenVNode(res)]
        }

        /**
         * tranform close tag
         *
         * </a>
         */
        if (isHTMLClose(res)) {
            return [generateHTMLTagCloseVNode(res)]
        }

        /**
         * tranform complete tag
         */
        if (isHTML(res)) {
            return generateHTMLTagVNode(res)
        }

        /**
         * TODO: 可能导致的转化问题
         */
        return escapeHtml(res)
    }
}
