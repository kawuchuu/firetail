const {version} = require('./package.json')

let buildNum = version

if (process.env.FTBUILD_NUM) {
    buildNum = `${version}-${process.env.FTBUILD_NUM}`
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
            externals: ['better-sqlite3'],
            builderOptions: {
                appId: "xyz.kawuchuu.firetail",
                productName: "Firetail",
                copyright: "Copyright © 2020 kawuchuu",
                extraMetadata: {
                    version: buildNum
                },
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