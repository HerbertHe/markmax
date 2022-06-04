import { VNode } from "million"
import { fromStringToVNode } from "million/utils"

/**
 * Convert html string to VNode
 *
 * @link https://github.com/aidenybai/million/issues/184
 * @param html
 * @returns
 */
export const fromHTMLStringToVNode = (html: string): VNode[] => {
    const res = fromStringToVNode(html)

    if (!Array.isArray(res)) {
        return [res]
    }

    return res
}
