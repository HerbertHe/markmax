import { version } from "../../package.json"

import { m, render } from "million"
import { fromVNodeToString } from "million/utils"
import { Options } from "markdown-it"

import { transformMarkdownToVNode } from "../transform/index"
import { IRendererOptions } from "../types/renderer"

/**
 * Test markdown-it plugin
 */
import { tested } from "../plugins/tested"
import { loadThemeStyle } from "../helper/loaders/theme"

/**
 * MarkMax Renderer
 */
export class Renderer {
    private _plugins = new Map()
    private _features = new Map()
    private _renderers = new Map()
    private _styles = new Map()

    private _markdownItOptions: Options = null

    readonly version = version

    constructor({ theme, plugins, markdownit }: IRendererOptions) {
        this._plugins = plugins
        markdownit.plugins = [...tested]
        this._markdownItOptions = markdownit
        this._setup()
        if (!!theme) {
            // load theme from plugins
            loadThemeStyle(["theme", `./assets/${theme}.css`])
        }
    }

    // setup
    private _setup = () => {
        console.log(`MarkMax Version: ${version}`)

        if (!!this._plugins) {
            // TODO regester plugins

            // this._registerPlugins()
            this._loadStyles()
        }
    }

    // TODO 注册插件
    private _registerPlugins = (plugins) => {
        // const { renderers, features, styles } = loadVditorPlugins(plugins)
        // if (this._features.size === 0 && this._renderers.size === 0 && this._styles.size === 0) {
        //     this._features = features
        //     this._renderers = renderers
        //     this._styles = styles
        // } else {
        //     // Update plugins
        //     this._features = new Map([...this._features, ...features])
        //     this._renderers = new Map([...this._renderers, ...renderers])
        //     this._styles = new Map([...this._styles, ...styles])
        // }
    }

    // TODO update plugins
    private _updatePlugins = (plugin) => {
        // const [unusablePlugins, usablePlugins] = this._filterPlugins(new Map([[plugin.id, plugin]]))
        // if (unusablePlugins.length > 0) {
        //     console.error(unusablePlugins.map(([, , msg]) => msg).join("\n"))
        // }

        // this._registerPlugins(usablePlugins)
    }

    // TODO load plugin styles
    private _loadStyles = () => {
        // loadVditorPluginsStyle(this._styles)
    }

    private _createMarkMaxVNode = (content: string) => {
        return m(
            "div",
            {
                class: "markmax"
            },
            transformMarkdownToVNode(content, this._markdownItOptions),
            1
        )
    }

    /**
     * Export Vnode Method
     * @param content Markdown content
     */
    exportVNode = (content: string) => {
        return this._createMarkMaxVNode(content)
    }

    /**
     * Export HTML Method
     * @param content Markdown content
     */
    exportHTML = (content: string) => {
        return fromVNodeToString(this._createMarkMaxVNode(content))
    }

    /**
     * Render Method
     * @param content markdown content
     * @param id element id
     */
    render = (content: string, id: string) => {
        const el = document.getElementById(id)
        if (!el) {
            throw new Error("Element Not Found!")
        }
        // TODO 考虑先加载样式表

        render(el, this._createMarkMaxVNode(content))
    }

    /**
     * TODO: use function
     * @param plugin
     * @returns
     */
    // use = (plugin) => {
    //     this._updatePlugins(plugin)
    //     return this
    // }
}
