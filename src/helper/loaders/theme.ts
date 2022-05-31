import { ThemeType } from "../../types/theme"

/**
 * Load theme style
 * @param theme
 */
export const loadThemeStyle = (theme: ThemeType) => {
    const [id, url] = theme

    if (!id || !!document.getElementById(`markmax-style-${id}`)) {
        // 没有正确的 id / 样式已经加载
        return
    }

    const link = document.createElement("link")
    link.id = `markmax-style-${id}`
    link.rel = "stylesheet"
    link.href = url
    document.head.appendChild(link)
}