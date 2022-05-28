import { VElement, VNode } from "million"

export class Washer {
    private _vnode: VNode[] = []
    private _elStack: VNode[] = []
    private _res: VNode[] = []
    private _idx = 0
    constructor(vnode: VNode[]) {
        this._vnode = vnode
    }

    private _worker(node: VNode) {
        if (typeof node === "string") {
            const children = (<VElement>this._elStack[this._elStack.length - 1]).children
            if (!!children) {
                (<VElement>this._elStack[this._elStack.length - 1]).children.push(node)
            } else {
                (<VElement>this._elStack[this._elStack.length - 1]).children = [node]
            }
            return
        }

        if (node.props?.nesting === 1) {
            delete node.props.nesting;
            this._elStack.push(node)
            return
        }

        if (node.props?.nesting === -1) {
            const curr = this._elStack.pop()
            const preNode = this._elStack[this._elStack.length - 1]
            if (!!preNode) {
                const children = (<VElement>preNode).children
                if (!!children) {
                    (<VElement>preNode).children.push(curr)
                } else {
                    (<VElement>preNode).children = [curr]
                }
            } else {
                this._res.push(curr)
            }
            return
        }

        // BUG 处理 nesting = 0 的节点, 错误的节点排列顺序需要修改，错误的树
        if (node.props?.nesting === 0) {
            delete node.props.nesting
            // 向父节点添加子项
            const preNode = this._elStack[this._elStack.length - 1]
            if (!!preNode) {
                const children = (<VElement>preNode).children
                if (!!children) {
                    (<VElement>preNode).children.push(node)
                } else {
                    (<VElement>preNode).children = [node]
                }
            } else {
                this._res.push(node)
            }
            return
        }
    }


    wash = () => {
        if (this._vnode.length === 0) {
            return []
        }

        while (this._idx < this._vnode.length) {
            const node = this._vnode[this._idx]
            this._worker(node)
            this._idx++
        }

        return this._res
    }
}