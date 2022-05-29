import { fromStringToDomNode, fromDomNodeToVNode } from "million/utils"

export const fromHTMLStringToVNode = (html: string) => {
    return fromDomNodeToVNode(fromStringToDomNode(html))
}
