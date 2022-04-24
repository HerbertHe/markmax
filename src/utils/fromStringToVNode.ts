import type { VNode } from "million"
import { html } from "million/html"

export const fromStringToVNode = (content: string): VNode[] => {
    const h = html`${content}`
    if (Array.isArray(h)) {
        return h
    }

    return [h]
}
