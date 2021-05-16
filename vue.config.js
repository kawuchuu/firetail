const fs = require('fs')

if (process.env.FTBUILD_NUM) {
    fs.writeFile('./public/build.txt', process.env.FTBUILD_NUM, (err) => {
        if (err) console.error(err)
    })
}

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
            contextIsolation: false,
            externals: ['better-sqlite3'],
            builderOptions: {
                appId: "xyz.kawuchuu.firetail",
                productName: "Firetail",
                copyright: "Copyright © 2021 kawuchuu",
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
                        },
                        {
                            ext: 'm4a',
                            name: 'M4A',
                            description: 'M4A File'
                        },
                        {
                            ext: 'flac',
                            name: 'FLAC',
                            description: 'FLAC File'
                        },
                        {
                            ext: 'ogg',
                            name: 'OGG',
                            description: 'OGG File'
                        },
                        {
                            ext: 'wav',
                            name: 'WAV',
                            description: 'WAV File'
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