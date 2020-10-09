# Reshift-NPM-Plugin
*Your source code deserves more. Defend.*<br/>
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 [--reshift security](https://www.reshiftsecurity.com "Reshift Homepage")

## Local Development
##### Requirements
* NPM version >= 5.2.0
* git

## Debugging / Quick testing
### Linking to local NPM
Here are example steps to "link" this package to your global npm installation. This will mimic as if you have installed the plugin globally and your plugin changes will take effect once you save and re-run.

```
cd ~/projects/npm-plugin    # go into the plugin directory
npm link                    # creates global link
```

Then you can go into a folder where some javascript code exists and run the plugin `reshift-scan -t <report_token>`

### Debugging
Create a VSCode NodeJS run configuration similar to the one below. You need to update the argument values from the example below. You may also consider passing the `-p` argument to point to where your javascript source code to be scanned is.
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
                "<token>"
            ]
        }
    ]
}
```
Once you have that setup, place your breakpoints, open the debug tab from VSCode and click the run button to debug.
