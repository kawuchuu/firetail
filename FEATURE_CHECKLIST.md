# Firetail Feature Checklist
*Created: 02/01/2023, Updated: 02/09/2023*

## Features required for completion before releasing v1.0.0
- Library
  - ~~Improve artist detection (use 'artists' and 'albumartist' tags)~~
  - Recursive directory importing
- Playlists
  - Manually change song position
  - Change playlist position on sidebar
  - Remove images from playlists
  - Generally fix jankiness
- Home
  - Make dynamic sections, not hard-coded
  - Come up with new ideas as I build it
- ~~Finally start making the favourites page~~
- Search
  - ~~General search on the top bar (search for everything)~~
  - Search in current viewing list
- Accessibility
  - Finish high contrast mode
  - Add specific colourblind colour mode? (?)
  - Screen reader support
  - Better keyboard-only navigation
- Queue
  - Queue management popup
  - Only view current queue
- Bug fixes & improvements
  - Random scrolling between pages
  - Try to make the sticky bar on song list pages work better
  - Make UI as smooth and quality as possible
  - Fix shuffling
  - Clean up A LOT of code. Make things like audio and settings a proper system instead of the current jank
- ~~Explicit tag~~
- RTL UI
- Updates
  - Let user check for updates
  - Choose update branch
- ~~Migrate to Electron Forge~~


## Features that can (probably) wait for later versions
- Appearance
  - App theming: both built-in and custom
- Queue
  - Edit current queue
  - Add song to queue in context menu
- Spotify integration
  - ~~Authorisation~~
  - Artist images
  - Pull metadata for songs missing it
  - Add local song to playlist
- Last.fm integration
  - Authorisation
  - Add scrobbling support
  - Maybe some metadata support? (spotify does this already though)
- Effects
  - Tempo, pitch, reverb effects
  - Low and high pass filters?
- Equalisation
- Playlists
  - Import m3u playlists?
- Plugins
  - I don't know how well I can make this work with Webpack, tried it a couple years ago with no luck
  - API for stuff like sidebar, screens, settings etc.