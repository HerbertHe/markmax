import { checkVditorPluginCompatible, checkVditorPluginIdentifier, loadVditorPlugins, loadVditorPluginsStyle, version as VPVersion } from "vditor-plugin"
import type { IVditorPlugin, VditorPluginFeaturesType, VditorPluginRenderersType, VditorPluginStylesType, VditorPluginsType } from "vditor-plugin/dist/types"
import { version } from "../../package.json"
import { render } from "million"

interface IRendererOptions {
    plugins?: VditorPluginsType
}

/**
 * 渲染器
 */
export class Renderer {
    private _plugins: VditorPluginsType = new Map()
    private _features: VditorPluginFeaturesType = new Map()
    private _renderers: VditorPluginRenderersType = new Map()
    private _styles: VditorPluginStylesType = new Map()

    readonly version = version

    constructor({ plugins }: IRendererOptions) {
        this._plugins = plugins
        this._setup()
    }

    // setup
    private _setup = () => {
        console.log(`Vditor Plugin Version: ${VPVersion}`)

        const [unusablePlugins, usablePlugins] = this._filterPlugins(this._plugins)
        if (unusablePlugins.length > 0) {
            console.error(unusablePlugins.map(([, , msg]) => msg).join("\n"))
        }

        this._registerPlugins(usablePlugins)
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
        this._loadStyles()

        // TODO 使用 million 渲染DOM
        // render(el, )
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
