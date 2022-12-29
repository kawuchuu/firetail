<center>
    <img height="150" src="./banner.svg"/>
    <h3>The next-generation of local music players.</h3>
</center>

---

## Releases

[Click here](https://github.com/kawuchuu/firetail/releases/latest) to download the latest stable release for your system.

|  Operating System  |       File Extension      |
|:-------------------|:--------------------------|
|Windows             |`.exe`                     |
|macOS               |`.dmg`                     |
|Linux               |`.AppImage`, `.deb`, `.rpm`|

If you'd like to try the latest unstable release, check out the snapshot builds [here.](https://github.com/kawuchuu/firetail/releases/continuous) (Please note these builds are incomplete and may not function as expected)

## Prerequisites
- Python 3.x is required for all platforms to install dependencies.

- To install dependencies and build on Windows, you'll need to install the 'Desktop development with C++' component with Visual Studio Build Tools or Visual Studio Community via Visual Studio Installer.

- Due to a dependency on an older version of Webpack, it is recommended to use Node 16.X. Newer versions of Node may not work correctly.

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