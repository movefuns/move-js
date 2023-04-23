export class Utils {

    static supportPackageOrigin(url: string): boolean {

        return (url.startsWith("http") && url.endsWith(".git")) || (url.startsWith("/") && (url.endsWith(".zip")))
    }

    static resolveName(url: string): string {
        let t = url.split("/")

        if (url.endsWith(".git")) {
            return t[t.length].replace(".git", "")
        }

        if (url.endsWith(".zip")) {
            return t[t.length].replace(".zip", "")
        }
    }
}