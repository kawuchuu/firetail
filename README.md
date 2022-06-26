<div style="text-align: center">
    <img height="150" src="./banner.svg"/>
    <p style="font-weight: bold; font-size: 16px">Bringing local music players to the modern era 🎶</p>
    <!-- I will create a page for Firetail with a new domain in the future -->
    <!-- <a style="font-weight: bold">https://example.com/firetail</a> -->
    <a href="https://actions-badge.atrox.dev/kawuchuu/firetail/goto?ref=next"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fkawuchuu%2Ffiretail%2Fbadge%3Fref%3Dnext&style=for-the-badge" /></a>
</div>

---

## Releases

[Click here](https://github.com/kawuchuu/firetail/releases/latest) to download the latest stable release for your system.

|  Operating System  |       File Extension      |
|:-------------------|:--------------------------|
|Windows             |`.exe`                     |
|macOS               |`.dmg`                     |
|Linux               |`.AppImage`, `.deb`, `.rpm`|

If you'd like to try the latest unstable release, check out the snapshot builds [here.](https://github.com/kawuchuu/firetail/releases/continuous) (Please note these builds are incomplete and may not function as expected)

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