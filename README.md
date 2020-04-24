# Reshift-NPM-Plugin
*Your source code deserves more. Defend.*<br/>
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 [--reshift by SoftwareSecured](https://www.softwaresecured.com/reshift/ "Reshift's Homepage")

## Use Cases
* Show customers evidence that every code change gets scanned for security violations
* Integrate security early so your quartely penetration tests run more smoothly
* Notify your developers of issues THEY have created within the software code base
* A convenient way to automate application security testing

## Standard Installation
##### Requirements
* NPM version >= 5.2.0
* git
* Unix environment
##### Method
1. ```sudo -H npm i -g reshift_npm_plugin``` (you will need sudo privilege as it need to access bin folder)
2. ```reshift-scan -v``` to check if the installation is successful
##### Usage
1. ```reshift-scan -t <report_token> -e <reshift_url> -i <javascript_source_dir>``` to run the scan on current folder (endpoint '-e' defaults to reshift website)
2. ```reshift-scan -h``` to see help

## Local Installation
##### Requirements
* NPM version >= 5.2.0
* git
* npx
##### Method
1. ```npm i reshift_npm_plguin```
2. ```npx node_modules/reshift_npm_plugin/ -v``` to check if the installation is successful
##### Usage
1. ```npx node_modules/reshift_npm_plugin/ -t <report_token> -e <reshift_url> -i <javascript_source_dir>``` to run the scan on current folder (port and host default to reshift website)
2. ```npx node_modules/reshift_npm_plugin/ -h``` to see help

## Debugging / Quick testing
##### Linking to local NPM
Here are example steps to "link" this package to your global npm installation. This will mimic as if you have installed the plugin globally and your plugin changes will take effect once you save and re-run.

```
cd ~/projects/npm-plugin    # go into the plugin directory
npm link                    # creates global link
```

Then you can go into a folder where some javascript code exists and run the plugin `reshift-scan -t <report_token> -e <reshift_url> -i <javascript_source_dir>`

You can also "install" your linked package in another project using npm link.

```
cd ~/projects/node-bloggy   # go into other package directory
npm link reshift-plugin-npm # link-install the package
```
##### Debugging
Create a VSCode NodeJS run configuration similar to the one below. You may need to update the values for 'token', 'endpoint', and 'inDir' (where your javascript source code is).
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/main.js",
            "args": [
                "-t",
                "<token>",
                "-e",
                "http://localhost:8000",
                "-i",
                "/path/to/javascript/source"
            ]
        }
    ]
}
```
Once you have that setup, place your breakpoints, open the debug tab from VSCode and click the run button to debug.

## Resources
[Js Documentation Page](https://softwaresecured.github.io/npm_plugin/ "Reshift NPM Plugin")

## Help
Have more questions? Feel free to [contact us](mailto:support@softwaresecured.com)