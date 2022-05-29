import Token from "markdown-it/lib/token"
import { VNode } from "million"
import { IRendererOptions } from "./renderer"

export type ResultNode = VNode[] | string

export type RuleCallbackType = (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => ResultNode
