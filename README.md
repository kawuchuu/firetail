# Audiation
![Build Status](https://travis-ci.org/projsh/audiation.svg?branch=master)(https://travis-ci.org/projsh/audiation)

Open-source music player built with Electron. Currently in beta, but useable.

# Features
## Current Features
  - Simple song list, click a song on the list to play.
  - Clean UI
  - Essential controls: seek bar, pause/play, forward, previous, shuffle, repeat
  - ID3 tag support
  - Custom volume controls
  - **Linux only:** MPRIS support (thanks Victor)

## Planned Features
  - Multiple source support
  - Playlist creation
  - Search filter
  - Song, album, artist lists
  - Customisable Settings
  - Song list contains artist, album, duration column
  
# How to run
You can either use the executables provided or build it yourself.

## Build/Run
  1. `git clone https://github.com/projsh/audiation.git`
  2. `cd audiation`
  3. `npm install`
  4. **Optional. Linux only.** If you run into Node module errors, try rebuilding `dbus` using `electron-builder`.
  5. `npm start`
  6. **Optional.** If you'd like to build an executable, run `electron-builder --<platform>`. If you're building for Linux, `electron-builder` will create an AppImage, a Debian package, and a Pacman package. If you're building for Windows, `electron-builder` will create an installer and a portable executable. If you're building for macOS, `electron-builder` will create a DMG file. If you want to build other package types, edit `package.json`.
