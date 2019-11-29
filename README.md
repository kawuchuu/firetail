# Firetail
[![Build Status](https://travis-ci.org/projsh/firetail.svg?branch=master)](https://travis-ci.org/projsh/firetail) [![Build status](https://ci.appveyor.com/api/projects/status/2i89yhge8rj42i9v?svg=true)](https://ci.appveyor.com/project/projsh/firetail)

Open-source music player built with Electron. Currently in beta, but useable.

## 0.4.0 (pre-release)
**IMPLEMENTED:**
- New library management system (iTunes-like)
- Forward / reverse 5 seconds using arrow keys
- Effects panel works again
- Minor UI tweaks
- MPRIS works again for Linux systems
- More efficient way of loading setting panels
- Display last played song when Firetail is launched
- Option to hide side panel
- Black theme (great for OLEDs)
- Native title bar toggle (for Windows & Linux)
- Custom CSS support
- Support native media controls for Windows

**IN DEVELOPMENT / UNFINISHED:**
- Song list now displays information about each song such as artist, album and song name instead of the file name
- Better touch screen support
- Re-introduce playlists
- Implement artist / albums tabs

**PLANNED:**

Everything planned is now either finished or in development! 🎉
  
# Running / building
You can either use the executables provided or build it yourself.

**IMPORTANT INFO FOR WINDOWS:**

You *must* have VS 2017 build tools installed prior to running or building on Windows. To install these tools, run `npm i -g --production windows-build-tools --vs2017` from an elevated terminal. You may also need to rebuild some modules specifically for Electron. There are numerous ways of doing this, however I personally use electron-rebuild.

## Run
  1. `git clone https://github.com/projsh/firetail.git`
  2. `cd firetail`
  3. `yarn install`
  4. `yarn start`

## Build
  1. `git clone https://github.com/projsh/firetail.git`
  2. `cd firetail`
  3. `yarn install`
  4. `yarn global add electron-builder`
  5. `yarn release`