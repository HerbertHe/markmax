import { Options, PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it"
import { VditorPluginsType } from "vditor-plugin/dist/types"

export type MarkdownItPlugin = PluginSimple | PluginWithOptions | PluginWithParams

/**
 * MarkMax Renderer Options
 * @param theme - MarkMax Theme
 * @param options Options Support for markdown-it
 * @param plugins MarkMax Plugins
 */
export interface IRendererOptions {
    theme?: string
    markdownit?: Pick<Options, "linkify" | "html" | "breaks" | "typographer"> & {
        warning?: boolean = true
        plugins?: MarkdownItPlugin[]
    }
    plugins?: VditorPluginsType
}
