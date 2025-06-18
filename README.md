# Welcome to the Indiv AI Character chat app (dev build) (Android)
This was a project undertaken for my undergraduate Third Year Dissertation containing a simple suite of restful Apis
Namely: Gemini AI and Stability AI.

The messaging app at its core consists of a simple character creation loop and a chat feature, 
both require you to set up your own Api keys with their respecting service.

- [Gemini AI](https://aistudio.google.com/welcome)
- [Stability AI](https://platform.stability.ai/)

Once you have your Api keys create a '.env' file in the root directory conatining these two variables

- GEMINI_API_KEY = Your_ApiKey
- STABILITY_API_KEY = Your_ApiKey

The app is built off of React native SDK 51 so refer to this version for any documents or packages you would like to add to your copy of the software. The project was built as a smart phone application so it will not run as expected in a web browser, for example you cannot save characters as is in a web browser.

There is no 'backend' per say for this Application save for the connections to the restful Api's.

Directly Below is draftbit's tutorial on how to get the project up and running locally in visual studio code. (Drafbit is a low - no code app building software. 
In this project it was mainly utilised for its visual interface building enviornment.)
If you have experience in Android studio's emulators those work fine once you build it, however Expo Go (Version 51) is simpler to setup quickly. To build the app you need a React Native Expo account, which the tutorial breifly directs you to the relevant docs.

# Welcome to your Draftbit app!

This `README` is designed to help you get your Draftbit app running locally. Read
through the next few sections carefully, and if you encounter any issues please
do not hesitate to post in [Community](https://community.draftbit.com).

> Note that all of the commands in this document should be run using your
> computer's **command line**. If you're unsure of what this is, please read
> [this](https://tutorial.djangogirls.org/en/intro_to_command_line/) guide
> before moving on.

## Requirements

- [Node.js LTS release](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall) for macOS and Linux users
- [Yarn](https://classic.yarnpkg.com/en/docs/install) use this over `npm install` when installing dependencies

> Only Node.js LTS releases (even-numbered) are recommended. As Node.js [officially states](https://nodejs.org/en/about/releases/), "Production applications should only use Active LTS or Maintenance LTS releases."

## Recommended Tools

- [VSCode Editor](https://code.visualstudio.com/download)
  - [VSCode Expo Extension](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools) for `app.json` debugging and autocomplete.
- Windows users: [PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows), Bash via WSL, or the VSCode terminal.
- Expo Go for iOS and Android
  - 🤖 [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) - Android Lollipop (5) and greater.
  - 🍎 [iOS App Store](https://itunes.com/apps/exponent) - iOS 11 and greater.

## Installing Node.js

You can install Node by going to the [website directly](https://nodejs.org/en/) and clicking the side that says "Recommended For Most Users". This will guide you through the process.

Once Node has been installed, run the following on the command line to make sure
it's been installed correctly:

```
$ node -v
```

If you see the current version of Node in response, you've successfully
installed Node on your machine.

For example,

```
$ node -v
v16.15.1
```

[Learn more about installing Nodejs](https://nodejs.dev/en/learn/how-to-install-nodejs/)

> 😳 **Need help?** Try searching the [Community](https://community.draftbit.com) &mdash; which are a great resource for troubleshooting.

## Install Project Dependencies

First, navigate to the project directory. The .zip will likely be in your
downloads folder, so extract the .zip and move it to the desired location
before proceeding.

Now, run the following commands to install the project dependencies (note that
you'll need an internet connection to do so).

```
$ cd Desktop/New-App
$ yarn
```

> The `cd` command above takes you into the project directory so you can install
> the correct dependencies. You should replace `Desktop/New-App` with the actual
> path to your unzipped project folder.

## Log In to Expo

Verify that the installation was successful by running `npx expo whoami`. You're not logged in yet, so you will see "Not logged in". You can create an account by running `npx expo register` if you like, or if you have one already run `npx expo login`, but you also don't need an account to get started.

[Learn more about Expo CLI here](https://docs.expo.io/get-started/installation/#installing-expo-cli)

## Running

To start your project, simply run: `yarn start` inside of the project directory
(make sure you've [installed the project dependencies](#install-project-dependencies) first). This should open the Expo
developer tools in the command line.

### Running in an emulator

You can run your app on your mobile device, on the iOS simulator (if you have
a Mac), or on the Android emulator. If you'd prefer to run your app on an
emulator, see the installation instructions below.

- [iOS Simulator](https://docs.expo.io/workflow/ios-simulator/)
- [Android Studio](https://docs.expo.io/workflow/android-studio-emulator/)

After installing and launching the emulator, and while in the command line, type `a` to launch on the Android emulator or `i` to launch on the IOS simulator. You can also press `w` to launch on web.

### Running on your Android or iOS Device

The fastest way to get up and running is to use the Expo Go app on your iOS or Android device. Expo Go allows you to open up apps that are being served through Expo CLI.

- 🤖 [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) - Android Lollipop (5) and greater.
- 🍎 [iOS App Store](https://itunes.com/apps/exponent) - iOS 11 and greater.

After installing, scan the barcode you see in the command line.

> If you are using custom packages, then there is a chance your app will not run on Expo Go. In that case, you need to [create your own build of the app](https://docs.expo.dev/build/setup/)

## File Structure

```
.
    ├── assets                 # Static assets like images and fonts.
    ├── config                 # JS representation of fonts, images, and more
    ├── screens                # React Native code for the screens you built.
    │   └── MyFirstScreen.js   # Example file for the screen named "My First Screen"
    ├── themes                 # JS representation of the theme
    ├── .gitignore             # List of files to ignore when comitting with Git
    ├── App.js                 # Entry point for your app
    ├── app.json               # Configuration file for your app, used by Expo
    ├── AppNavigator.js        # Code for your app's navigators
    ├── package.json           # The metadata for your project, including dependencies
    └── README.md              # This file!
```

## Publishing your app to the App Store

Expo has really great documentation for how to get started. [Click here](https://docs.expo.dev/build/setup/) to learn more.

## Troubleshooting

Any errors that may occur in the process of developing or testing your app will show up as a "Redbox" error on the testing device. A red box will be show on the device with the error message and stack trace for the error. The Expo documentation has [more information about Redbox errors](https://docs.expo.dev/debugging/errors-and-warnings).

Compilation errors or errors occurring when the expo process tries to execute
commands will also show up in the command line. If you cannot fix these errors, you
should refer to Expo's documentation on [debugging
Javascript](https://docs.expo.dev/debugging/runtime-issues).

## FAQ
- _How do I build a binary for the App and Play store?_

  Expo published an [excellent
  guide](https://docs.expo.dev/build/setup/) for
  deploying to the Apple App Store and the Google Play Store.

- _What libraries does this code depend on?_

  You can see the full list in your projects `package.json` file (under the
  `dependencies` section).
