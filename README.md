<center>
    <img height="150" src="./banner.svg"/>
    <h3>The next-generation of local music players 🎵</h3>
</center>

---

## Current development status

Firetail is currently still in development, however since June 2022 has been developed in a separate private repository. I will keep working on it privately until Release Candidate 1 is ready. I do not know how long it will take to release RC1; I am hoping sometime before the end of 2023 but please understand this is an estimate and may take longer, afterall it's a side project that I am working on in my spare time. It has been progressing well, with playlists, accessibility and quality-of-life tweaks being the focus with more to come. (Be sure to check back for development updates! I may show some screenshot updates on [my profile README](https://github.com/kawuchuu/kawuchuu/blob/master/README.md))

## Releases

[Click here](https://github.com/kawuchuu/firetail/releases/latest) to download the latest stable release for your system.

|  Operating System  |       File Extension      |
|:-------------------|:--------------------------|
|Windows             |`.exe`                     |
|macOS               |`.dmg`                     |
|Linux               |`.AppImage`, `.deb`, `.rpm`|

If you'd like to try the latest unstable release, check them out [here.](https://github.com/kawuchuu/firetail/releases/continuous) (Please note these builds are incomplete and may not function as expected)

## Building

Clone repository:
```
git clone https://github.com/kawuchuu/firetail.git .
```
Install dependencies (`yarn` is preferred over `npm`):
```
yarn install
```
**(Optional)** If you want to run in developer mode *without* building:
```
yarn electron:serve
```
Build artifacts:
```
yarn electron:build
```
