<!-- ![Logo of the project](https://raw.githubusercontent.com/jehna/readme-best-practices/master/sample-logo.png) -->

# William Moraes Userscripts

> Scripts to keep yourself sane and productive

Here are some of my userscripts that I use on a daily basis to keep myself sane, productive and in love with some web applications that lack some kind of functionality or UI/UX polishness.

## Usage

  All these scripts can be found and installed from my [OpenUserJS](https://openuserjs.org/users/wwmoraes/scripts) profile.

This repository also has a webhook to OpenUserJS, so all changes here updates the scripts there. This means that if your browser/extension supports updates, you'll be notified acordingly.

### Initial Configuration

Some scripts require configuration, which is present in the very first lines of code, after the usual preamble block.

## Developing

To start coding:

```shell
git clone https://github.com/wwmoraes/userscripts.git
cd userscripts/
yarn install
```

Although these are simple JS files, this repo uses ESLint to lint and keep a single code style.

You'll be able to test by installing the local version, as most extensions allows that. Some others will even allow editing through it's interface (e.g. Tampermonkey).

### Deploying / Publishing

This repository has the OpenUserJS webhook attached, so all changes committed to the master branch will also be published to OpenUserJS. Remember to bump the script version on it's preamble, so users will be notified of the new version, if using an userscript version-aware browser/extension.

## Contributing

To contribute, send a PR with the changes, and include your OpenUserJS user as a collaborator just below the author setting on the userscript preamble:

```js
// @author wwmoraes
// @collaborator <your-username>
```

Also, please stick to the repository commit messages' semantics, which are:

```text
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

Type examples:

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)

## Links

- Project homepage: [https://github.com/wwmoraes/userscripts](https://github.com/wwmoraes/userscripts)
- Repository: [https://github.com/wwmoraes/userscripts](https://github.com/wwmoraes/userscripts)
- Issue tracker: [https://github.com/wwmoraes/userscripts/issues](https://github.com/wwmoraes/userscripts/issues)

## Licensing

The code in this project is licensed under GPL-3.0 license.
