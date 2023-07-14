<center>
    <img height="150" src="./banner.svg"/>
    <h3>The next-generation of local music players 🎵</h3>
</center>

---

## Releases

[Click here](https://github.com/kawuchuu/firetail/releases/latest) to download the latest stable release for your system.

If you'd like to try the latest unstable release, check them out [here.](https://github.com/kawuchuu/firetail/releases/continuous) (Please note these builds are incomplete and may not function as expected)

## Platform Information
### Windows
- Requires Windows 10 and up, and a compatible x64 processor
- You'll need to download the '.exe' file to install Firetail

### macOS
- Requires macOS 10.13 and up, supports both Intel and Apple Silicon Macs
- You'll need to download the '.dmg' file to install Firetail (includes a Universal binary - works on Intel and Apple Silicon)

### Linux
- Requires a distribution and desktop environment compatible with up-to-date versions of Chromium. Pre-built binaries only support x64 processors, however Firetail can be built for arm64 processors.
- Users of distros supporting APT (Debian, Ubuntu, Mint) should download the '.deb' file, users of distros supporting RPM (Red Hat, Fedora, openSUSE) should download the '.rpm' file, and users of other distros should download the '.AppImage' file.
- Other methods of installation may be supported in the future, such as Flatpak and the AUR.

## Build for your platform

### Prerequisites
- Python 3.x is required for all platforms to install dependencies.

- To install dependencies and build on Windows, you'll need to install the 'Desktop development with C++' component with Visual Studio Build Tools or Visual Studio Community via Visual Studio Installer.

### Building

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
yarn start
```
Build artifacts:
```
yarn make
```