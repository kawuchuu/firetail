module.exports = {
    devServer: {
        host: 'localhost',
        watchOptions: {
            poll: true
        }
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `@import "@/scss/_variables.scss";`
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            externals: ['better-sqlite3'],
            builderOptions: {
                appId: "xyz.kawuchuu.firetail",
                productName: "Firetail",
                copyright: "Copyright © 2020 kawuchuu",
                mac: {
                    category: "public.app-category.music",
                    target: "dmg",
                    icon: "build/icon-macos.png"
                },
                nsis: {
                    artifactName: "Firetail-Setup-${version}.${ext}",
                    uninstallDisplayName: "Firetail"
                },
                win: {
                    target: [
                        "nsis"
                    ],
                    icon: "build/icon.ico",
                    publisherName: "kawuchuu",
                    fileAssociations: [
                        {
                            ext: 'mp3',
                            name: 'MP3',
                            description: 'MP3 File'
                        }
                    ]
                },
                linux: {
                    target: [
                        {
                            target: "AppImage",
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
                },
                publish: null
            }
        }
    }
}