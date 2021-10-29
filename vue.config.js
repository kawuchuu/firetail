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
    /* css: {
        loaderOptions: {
            sass: {
                additionalData: `@import "@/scss/_variables.scss";`
            }
        }
    }, */
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            contextIsolation: false,
            externals: ['better-sqlite3', 'glasstron'],
            builderOptions: {
                appId: "xyz.kawuchuu.firetail",
                productName: "Firetail",
                copyright: "Copyright © 2021 kawuchuu",
                nsis: {
                    artifactName: "Firetail-Setup-${version}.${ext}",
                    uninstallDisplayName: "Firetail"
                },
                buildDependenciesFromSource: true,
                npmRebuild: true,
                nodeGypRebuild: true,
                win: {
                    target: [
                        "nsis"
                    ],
                    icon: "build/other/windows.ico",
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
                        },
                        {
                            target: "rpm",
                            arch: "x64"
                        },
                        {
                            target: "deb",
                            arch: "x64"
                        }
                    ],
                    icon: 'build/icons',
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
                mac: {
                    category: "public.app-category.music",
                    target: [
                        {
                            target: "dmg",
                            arch: "x64" // github actions doesn't play well with arm64... will be universal binary for proper releases :)
                        },
                        {
                            target: "dmg",
                            arch: "arm64"
                        }
                    ],
                    icon: "build/other/macos.png",
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
                publish: null
            }
        }
    }
}