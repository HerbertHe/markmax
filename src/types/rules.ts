import Token from "markdown-it/lib/token"
import MarkdownIt from "markdown-it"
import { VNode } from "million"
import { IRendererOptions } from "./renderer"

/**
 * Reference from @types/markdown-it/
 */
export declare namespace MarkdownItRenderer {
    type MarkdownItRenderRule = (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: MarkdownItRenderer) => string;

    interface MarkdownItRenderRuleRecord {
        [type: string]: MarkdownItRenderRule
        code_inline?: MarkdownItRenderRule
        code_block?: MarkdownItRenderRule
        fence?: MarkdownItRenderRule
        image?: MarkdownItRenderRule
        hardbreak?: MarkdownItRenderRule
        softbreak?: MarkdownItRenderRule
        text?: MarkdownItRenderRule
        html_block?: MarkdownItRenderRule
        html_inline?: MarkdownItRenderRule
    }
}

export declare class MarkdownItRenderer {
    rules: MarkdownItRenderer.MarkdownItRenderRuleRecord;
    renderAttrs(token: Token): string;
    renderToken(tokens: Token[], idx: number, options: MarkdownIt.Options): string;
    renderInline(tokens: Token[], options: MarkdownIt.Options, env: any): string;
    renderInlineAsText(tokens: Token[], options: MarkdownIt.Options, env: any): string;
    render(tokens: Token[], options: MarkdownIt.Options, env: any): string;
}

export type ResultNode = VNode[] | string

export type RuleCallbackType = (tokens: Token[], idx: number, options: IRendererOptions["markdownit"], slf: Transformer) => ResultNode

export type ReservedRulesKeysType = ""