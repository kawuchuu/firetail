<img height="150" src="./banner.svg"/>

# Firetail
### An open-source music player by kawuchuu

---

## Releases

[Click here](https://github.com/kawuchuu/firetail/releases/latest) to download the latest stable release for your system.

If you'd like to try the latest unstable build, check for the pre-release [here.](https://github.com/kawuchuu/firetail/releases) (Please note these builds are incomplete and may not function as expected)

## Platform Information
### Linux
- Requires a distribution and desktop environment compatible with up-to-date versions of Chromium. Pre-built binaries only support x64 processors, however Firetail can be built for arm64 processors.
- Firetail is available on the AUR for Arch-based systems. It is available under [firetail-bin](https://aur.archlinux.org/packages/firetail-bin) as a pre-built package.
- There are pre-built releases available as a .deb and .rpm package if your system supports it.
- If your system does not support any of these types of releases, it is also available as a standard ZIP file.

### Windows
- Requires Windows 10 and above, and a compatible x64 processor
- You'll need to download the '.exe' file to install Firetail
- SmartScreen may warn you that Firetail is unsafe. This is due to the app being unsigned, as well as having low traffic. To continue launching the installer, click 'more info', then 'run anyway'. If you don't trust the provided installer, you are always welcome to build Firetail yourself; build instructions are below.

### macOS
- Requires macOS 10.15 and up, only supports Apple Silicon Macs
- You'll need to download the '.dmg' file to install Firetail
- Due to limitations put in place by Apple, macOS will likely report unsigned apps downloaded from the internet as "damaged" or "cannot be opened".
If it says it is "damaged", type the following terminal command (assuming you placed the app in the default Applications folder): `xattr -c /Applications/Firetail.app`
Unfortunately there appears to be no way around this without code signing, which will reveal some personal details about myself, which I'm unwilling to share.

## Building for your system

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