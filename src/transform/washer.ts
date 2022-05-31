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

        // TODO 清除 tag 为空的标签
        if (node.tag === "") {
            return
        }

        if (node.props?.nesting === 1) {
            delete node.props.nesting;
            this._elStack.push(node)
            return
        }

        if (node.props?.nesting === -1) {
            let curr = this._elStack.pop()
            /**
             * 合并文本节点
             * TODO: 实验性代码，可能可以移除
             */
            if ((<VElement>node).tag === "p") {
                let tmp = curr as VElement
                if (!!tmp.children) {
                    if (tmp.children.every(child => typeof child === "string")) {
                        tmp.children = [tmp.children.join("")]
                        console.log()
                    } else {
                        tmp.children = tmp.children.filter(item => !!item)
                    }
                    curr = tmp
                }
            }

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
        if ([0, "0"].includes(node.props?.nesting)) {
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
