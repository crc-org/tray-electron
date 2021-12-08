Electron app for CodeReady Containers
=====================================

![](./docs/demo.png)


[![CircleCI](https://circleci.com/gh/code-ready/tray-electron/tree/master.svg?style=svg)](https://circleci.com/gh/code-ready/tray-electron/tree/master)

# Release

```
$ make release
```

You also need to add `crc` binary to the app. 

For macOS, please also run:
```
$ cp <path to crc release binary> release/tray-electron-darwin-x64/tray-electron.app/Contents/Resources/app/
```
# Development

To build the Electron tray you need to install nodejs in your system

We suggest you install `nvm` or `nvs` and use it to install nodejs version `16.13.1` 

1. Install NodeJS

    > _The following instructions are from [nodejs.dev](https://nodejs.dev)_
    ### Linux / macOS
    ```
    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash 
    $ nvm install 16.13.1
    ```
    ### windows
    ```
    PS> choco install nvs
    PS> nvs add 16.13.1
    PS> nvs use 16.13.1
    ```
2. Clone the repository and use `make` to build the tray app
    ```
    $ git clone https://github.com/code-ready/tray-electron.git
    $ cd tray-electron
    $ make
    ```
---
**NOTE** 

While making changes to the UI it is handy to see the rendered pages live as you are doing the changes

Starts electron concurrently with a live server which watches for changes and reloads as you save
```
$ make dev 
```

---