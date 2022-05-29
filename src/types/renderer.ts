import { Options, PluginSimple, PluginWithOptions, PluginWithParams } from "markdown-it"
import { VditorPluginsType } from "vditor-plugin/dist/types"

type MarkdownItPlugin = PluginSimple | PluginWithOptions | PluginWithParams

/**
 * MarkMax Renderer Options
 * @param theme - MarkMax Theme
 * @param options Options Support for markdown-it
 * @param plugins MarkMax Plugins
 */
export interface IRendererOptions {
    theme?: string
    markdownit?: Pick<Options, "highlight" | "linkify" | "html"> & {
        plugins?: MarkdownItPlugin[]
    }
    plugins?: VditorPluginsType
}
