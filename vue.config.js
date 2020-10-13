module.exports = {
    devServer: {
        host: 'localhost',
        watchOptions: {
            poll: true
        }
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            externals: ['better-sqlite3'],
            builderOptions: {
                appId: "com.projsh.firetail",
                productName: "Firetail",
                copyright: "Copyright © 2020 projsh_",
                mac: {
                    category: "public.app-category.music",
                    target: "dmg"
                },
                nsis: {
                    artifactName: "Firetail-Setup-${version}.${ext}",
                    uninstallDisplayName: "Firetail"
                },
                win: {
                    target: [
                        "nsis"
                    ],
                    icon: "assets/icon.ico",
                    publisherName: "projsh_"
                },
                linux: {
                    target: [
                        {
                            target: "AppImage",
                            arch: "x64"
                        },
                        {
                            target: "deb",
                            arch: "x64"
                        }
                    ],
                    category: "AudioVideo",
                    executableName: "firetail",
                    desktop: {
                        Type: "Application",
                        Name: "Firetail",
                        Comment: "Audio Player",
                        Icon: "firetail",
                        Terminal: "false"
                    }
                }
            }
        }
    }
}