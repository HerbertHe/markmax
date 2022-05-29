export const fromStringAttrsToObj = (attrs: string) => {
    const RegExp = /([a-z]+)(\=\"([^"]*)\")?/g
    let res = attrs.matchAll(RegExp)
    let obj: { [key: string]: string } = {}
    if (!!res) {
        RegExp.lastIndex = 0
        for (let i of res) {
            obj[i[1]] = i[3] || "true"
        }
    }

    return obj
}
