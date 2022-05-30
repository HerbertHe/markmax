// TODO 移除 vditor-plugin 设计
import {
    checkVditorPluginCompatible,
    checkVditorPluginIdentifier,
    loadVditorPlugins,
    loadVditorPluginsStyle,
    version as VPVersion
} from "vditor-plugin"
import type { IVditorPlugin, VditorPluginFeaturesType, VditorPluginRenderersType, VditorPluginStylesType, VditorPluginsType } from "vditor-plugin/dist/types"
import { version } from "../../package.json"

import { m, render, VNode } from "million"
import { Options } from "markdown-it"
import { transformMarkdownToVNode } from "../transform/index"
import { IRendererOptions } from "../types/renderer"

/**
 * TODO: 移除emoji尝试
 */
import emoji from "markdown-it-emoji"

/**
 * 渲染器
 */
export class Renderer {
    private _plugins: VditorPluginsType = new Map()
    private _features: VditorPluginFeaturesType = new Map()
    private _renderers: VditorPluginRenderersType = new Map()
    private _styles: VditorPluginStylesType = new Map()

    private _markdownItOptions: Options = null

    readonly version = version

    constructor({ theme, plugins, markdownit }: IRendererOptions) {
        this._plugins = plugins
        markdownit.plugins = [emoji]
        this._markdownItOptions = markdownit
        this._setup()
        if (!!theme) {
            loadVditorPluginsStyle(new Map([["theme", "./assets/markmax.css"]]))
        }
    }

    // setup
    private _setup = () => {
        console.log(`Markmax Version: ${version}`)
        console.log(`Vditor Plugin Version: ${VPVersion}`)

        if (!!this._plugins) {
            const [unusablePlugins, usablePlugins] = this._filterPlugins(this._plugins)
            if (unusablePlugins.length > 0) {
                console.error(unusablePlugins.map(([, , msg]) => msg).join("\n"))
            }

            this._registerPlugins(usablePlugins)
            this._loadStyles()
        }
    }

    // filter plugins
    private _filterPlugins = (plugins: VditorPluginsType): [[string, IVditorPlugin, string][], VditorPluginsType] => {
        let unusablePlugins: [string, IVditorPlugin, string][] = []
        let usablePlugins: VditorPluginsType = new Map()
        for (let key in plugins) {
            const { id, compatible } = plugins[key]
            if (!checkVditorPluginIdentifier(id)) {
                unusablePlugins.push([id, plugins[key], `Invalid plugin ID: ${id}`])
                continue
            }

            if (!checkVditorPluginCompatible(compatible, version)[0]) {
                unusablePlugins.push([id, plugins[key], `Plugin ${id} is not compatible with version ${version}`])
                continue
            }

            usablePlugins.set(key, plugins[key])
        }

        return [unusablePlugins, usablePlugins]
    }

    // 注册插件
    private _registerPlugins = (plugins: VditorPluginsType) => {
        const { renderers, features, styles } = loadVditorPlugins(plugins)
        if (this._features.size === 0 && this._renderers.size === 0 && this._styles.size === 0) {
            this._features = features
            this._renderers = renderers
            this._styles = styles
        } else {
            // Update plugins
            this._features = new Map([...this._features, ...features])
            this._renderers = new Map([...this._renderers, ...renderers])
            this._styles = new Map([...this._styles, ...styles])
        }
    }

    // update plugins
    private _updatePlugins = (plugin: IVditorPlugin) => {
        const [unusablePlugins, usablePlugins] = this._filterPlugins(new Map([[plugin.id, plugin]]))
        if (unusablePlugins.length > 0) {
            console.error(unusablePlugins.map(([, , msg]) => msg).join("\n"))
        }

        this._registerPlugins(usablePlugins)
    }

    private _loadStyles = () => {
        loadVditorPluginsStyle(this._styles)
    }

    /**
     * render function
     * @param content markdown content
     * @param id element id
     */
    render = (content: string, id: string) => {
        const el = document.getElementById(id)
        if (!el) {
            throw new Error("Element Not Found!")
        }
        // TODO 考虑先加载样式表
        const vnode: VNode = m(
            "div",
            {
                class: "markmax"
            },
            transformMarkdownToVNode(content, this._markdownItOptions),
            1
        )

        console.log(vnode)

        render(el, vnode)
    }

    /**
     * use function
     * @param plugin
     * @returns
     */
    use = (plugin: IVditorPlugin) => {
        this._updatePlugins(plugin)
        return this
    }
}
