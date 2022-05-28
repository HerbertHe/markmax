import type { VNode } from "million"
import { fromDomNodeToVNode, fromStringToDomNode } from "million/ssr"

interface IHTMLString {
    type: "text" | "html" | "code"
    props?: Record<string, any>
    content: string
}

const fromObjToString = (p: Record<string, any>) => {
    let s = []
    for (let k in p) {
        s.push(`${k}="${p[k]}"`)
    }

    return s.join(" ")
}

export const fromStringToVNode = ({ type, props, content }: IHTMLString): VNode => {
    return fromDomNodeToVNode(fromStringToDomNode(
        type === "code"
            ? `<code ${fromObjToString(props)}}>${content}</code>`
            : type === "text"
                ? `<p ${fromObjToString(props)}>${content}</p>`
                : `<div>${content}</div>`,
    ))
}
