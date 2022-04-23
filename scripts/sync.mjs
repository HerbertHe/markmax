import chokidar from "chokidar"
import path from "path"
import fs, { existsSync, mkdirSync } from "fs"

const __dirname = path.resolve()

function deepCopy(dir, target) {
    const dirs = fs.readdirSync(dir)
    if (dirs.length === 0) {
        return
    }

    dirs.forEach((item) => {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        if (stat.isDirectory()) {
            if (!fs.existsSync(path.join(target, item))) {
                fs.mkdirSync(path.join(target, item))
            }
            deepCopy(itemPath, path.join(target, item))
        } else {
            const targetPath = path.join(target, item)
            fs.copyFileSync(itemPath, targetPath)
        }
    })
}

if (!existsSync(path.join(__dirname, "demo", "assets"))) {
    mkdirSync(path.join(__dirname, "demo", "assets"))
}

chokidar
    .watch(path.join(__dirname, "dist"), {
        persistent: true,
    })
    .on("all", () => {
        deepCopy(
            path.join(__dirname, "dist"),
            path.join(__dirname, "demo/assets")
        )
    })
