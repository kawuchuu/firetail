module.exports = {
  packagerConfig: {
    asar: true,
    icon: './build/other/icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: './build/other/icon.ico'
      },
    },
    /* {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    }, */
    {
      name: '@electron-forge/maker-dmg',
      config: {
        title: "Firetail",
        background: './build/background.tiff',
        icon: './build/other/icon.icns',
        contents: (opts) => { return [
          { "x": 448, "y": 344, "type": "link", "path": "/Applications" },
          { "x": 192, "y": 344, "type": "file", "path": opts.appPath }
        ]}
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy: 'default-src \'self\' \'unsafe-inline\' data:; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data:; media-src \'self\' localhost local-resource:; img-src *',
        devServer: {
          hot: true
        },
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
  ],
};
