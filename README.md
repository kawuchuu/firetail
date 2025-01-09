<center>
    <img height="150" src="./banner.svg"/>
    <h3>A fun and beautiful desktop music player 🎵</h3>
</center>

---

## Releases

[Click here](https://github.com/kawuchuu/firetail/releases/latest) to download the latest stable release for your system.

If you'd like to try the latest unstable 'continuous' release, check them out [here.](https://github.com/kawuchuu/firetail/releases/continuous) (Please note these builds are incomplete and may not function as expected)

## Platform Information
### Windows
- Requires Windows 10 and up, and a compatible x64 processor
- You'll need to download the '.exe' file to install Firetail
- SmartScreen may warn you that Firetail is unsafe. This is due to the app being unsigned, as well as having low traffic. To continue launching the installer, click 'more info', then 'run anyway'. If you don't trust the provided installer, you are always welcome to build Firetail yourself; build instructions are below.

### macOS
- Requires macOS 10.15 and up, only supports Apple Silicon Macs
- You'll need to download the '.dmg' file to install Firetail
- Due to limitations put in place by Apple, macOS will likely report unsigned apps downloaded from the internet as "damaged" or "cannot be opened".
If it says it is "damaged", type the following terminal command (assuming you placed the app in the default Applications folder): `xattr -c /Applications/Firetail.app`
Unfortunately there appears to be no way around this without code signing, which requires a paid Apple Developer account and will reveal some personal details about myself, which I'm unwilling to share.

### Linux
- Requires a distribution and desktop environment compatible with up-to-date versions of Chromium. Pre-built binaries only support x64 processors, however Firetail can be built for arm64 processors.
- Users of distros supporting APT (Debian, Ubuntu, Mint) should download the '.deb' file, users of distros supporting RPM (Red Hat, Fedora, openSUSE) should download the '.rpm' file, and users of other distros should download the '.AppImage' file.
- Other methods of installation may be supported in the future, such as Flatpak and the AUR.
- For now, Firetail works best on X11; some features do not work correctly on Wayland.

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