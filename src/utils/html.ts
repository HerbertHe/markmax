import { m, VElement, VNode } from "million"
import { fromHTMLStringToVNode } from "./fromHTMLStringToVNode"
import { fromStringAttrsToObj } from "./fromStringAttrsToObj"

export const HTMLTagOpenRegExp = /^\<([a-z]+)\s*([^\<\>]+)?\>$/
export const HTMLTagCloseRegExp = /^\<\/([a-z]+)\>$/

export const HTMLTagRegExp = /^\<[a-z]+\s*([^\<\>]+)?\>(.*)\<\/[a-z]+\>$/

export const isHTMLOpen = (content: string) => {
    return HTMLTagOpenRegExp.test(content)
}

export const isHTMLClose = (content: string) => {
    return HTMLTagCloseRegExp.test(content)
}

/**
 * HTML
 * @param content
 * @returns
 */
export const isHTML = (content: string) => {
    return HTMLTagRegExp.test(content)
}

export const generateHTMLTagOpenVNode = (content: string) => {
    const [, tag, attrs] = content.match(HTMLTagOpenRegExp)
    let obj = fromStringAttrsToObj(attrs)
    return m(
        tag,
        {
            nesting: 1,
            ...obj
        }
    )
}

export const generateHTMLTagCloseVNode = (content: string) => {
    const [, tag] = content.match(HTMLTagCloseRegExp)
    return m(
        tag,
        {
            nesting: -1,
        }
    )
}

/**
 * Generate HTML Tag VNode
 *
 * support: fragments
 * @param content
 * @returns
 */
export const generateHTMLTagVNode = (content: string): VNode[] => {
    const res = fromHTMLStringToVNode(content)

    res.forEach(vnode => {
        if (!!vnode && typeof vnode !== "string") {
            const { props } = vnode
            vnode.props = {
                ...props,
                nesting: 0,
            }
        }
    })

    return res
}
