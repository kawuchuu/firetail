# Firetail Feature Checklist
*Created: 02/01/2023, Updated: 12/09/2024*

---

## Features required for completion before releasing v1.0.0
- Library
  - ~~Improve artist detection (use 'artists' and 'albumartist' tags)~~ ✅
  - ~~Recursive directory importing~~ ✅
- Playlists
  - ~~Manually change song position~~ ✅
  - Change playlist position on sidebar
  - Remove images from playlists
  - Generally fix jankiness
- ~~Finally start making the favourites page~~ ✅
- Search
  - ~~General search on the top bar (search for everything)~~ ✅
  - Search in current viewing list
- Accessibility
  - Finish high contrast mode
  - Add specific colourblind colour mode? (?)
  - Screen reader support
- ~~Queue~~ ✅
  - ~~Queue management popup~~ ✅
  - ~~Only view current queue~~ ✅
- Bug fixes & improvements
  - Random scrolling between pages
  - ~~Try to make the sticky bar on song list pages work better~~ ✅
  - Make UI as smooth and quality as possible
  - ~~Fix shuffling~~ ✅
  - ~~Clean up A LOT of code.~~ ❓ I'll do a little bit of cleaning up, but this is now a focus for Firetail 2.0.
- ~~Explicit tag~~ ✅
- ~~RTL UI~~ (mostly done needs a little more tweaking though)
- Updates
  - Let user check for updates
- ~~Migrate to Electron Forge~~ ✅
- Settings
  - ~~Improve way settings view is rendered~~
  - Add new setting storage solution
  - Implement new setting application solution


## Features that can (probably) wait for later versions
- Appearance
  - App theming: both built-in and custom
- Queue
  - Edit current queue
  - Add song to queue in context menu
- Library
  - Genre metadata
- Spotify integration
  - ~~Authorisation~~ ❓
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
  - Firetail 2.0 now uses Vite, so I'll experiment with this.
  - API for stuff like sidebar, screens, settings etc.
- Updates
  - Choose update branch
- Accessibility
  - Better keyboard-only navigation
- Home
  - Make dynamic sections, not hard-coded
  - Come up with new ideas as I build it