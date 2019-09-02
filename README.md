# Firetail
[![Build Status](https://travis-ci.org/projsh/firetail.svg?branch=master)](https://travis-ci.org/projsh/firetail)

Open-source music player built with Electron. Currently in beta, but useable.

## 0.4.0 (pre-release)
**IMPLEMENTED:**
- New library management system (iTunes-like)
- Forward / reverse 10 seconds using arrow keys
- Effects panel works again
- Minor UI tweaks
- MPRIS works again for Linux systems

**IN DEVELOPMENT:**
- Song list now displays information about each song such as artist, album and song name instead of the file name

**PLANNED:**
- Re-introduce playlists
- Implement artist / albums tabs
- Support Media Controls for Windows
  
# Running / building
You can either use the executables provided or build it yourself.

## Run
  1. `git clone https://github.com/projsh/firetail.git`
  2. `cd firetail`
  3. `yarn install`
  4. `yarn run start`

## Build
  1. `git clone https://github.com/projsh/firetail.git`
  2. `cd firetail`
  3. `yarn install`
  4. `yarn global add electron-builder`
  5. `yarn run build:(platform)`