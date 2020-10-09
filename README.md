[![Reshift Logo](https://reshiftsecurity-content.s3.ca-central-1.amazonaws.com/icons/reshift.png)](http://reshiftsecurity.com/)

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]

Reshift is a lightweight JavaScript security plugin for NPM that quickly finds vulnerabilities, offers multiple code remediation snippets and DevSec coaching to help build more secure code.
<br/>
<br/>
The plugin is for JavaScript developers looking to integrate security seamlessly into their software development practices. Reshift is wholly focused on security, allowing developers to meaningfully shift left - fixing security bugs early on.

## Features
* A curated list of JavaScript security checks, vetted by security experts
* Rich developer-centric issue descriptions
* DevSec coach and remediation assitance
* Additional vulnerability resources

> NOTE: Javascript scanning is only availabe to a closed beta group. To join the waitlist visit [reshiftsecurity.com](https://reshiftsecurity.com) and sign up.

Visit our documentation for help setting up NPM https://docs.reshiftsecurity.com/integrations/npm.

## Installation

```bash
$ npm install -g @reshiftsecurity/reshift-plugin-npm
```

## Usage

You will need a reshift account to able to use this plugin. [Sign up for free here](https://reshift.reshiftsecurity.com/onboarding)

Follow this instructions to on-board your git project and obtain your reshift token. You can then scan your project by running this command inside your project root:
```bash
$ reshift-scan -t <your reshift token here>
```
For more optional parameters, use the help argument `-h`
```bash
$ reshift-scan -h
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@reshiftsecurity/reshift-plugin-npm.svg
[npm-url]: https://npmjs.org/package/@reshiftsecurity/reshift-plugin-npm
[downloads-image]: https://img.shields.io/npm/dw/@reshiftsecurity/reshift-npm-plugin
[downloads-url]: https://npmcharts.com/compare/@reshiftsecurity/reshift-plugin-npm?minimal=true

## Help
Have more questions? Feel free to [contact us](mailto:dev@reshiftsecurity.com)
