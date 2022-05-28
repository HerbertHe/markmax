import Token from "markdown-it/lib/token"
import { VNode } from "million"

export type ResultNode = VNode[] | string

export type RuleCallbackType = (tokens: Token[], idx: number, slf: Transformer) => ResultNode
