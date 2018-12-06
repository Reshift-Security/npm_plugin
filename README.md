# Reshift-NPM-Plugin
*Your source code deserves more. Defend.*<br/>
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 [--reshift by SoftwareSecured](https://www.softwaresecured.com/reshift/ "Reshift's Homepage")

## Usa Cases
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
1. 'sudo -H npm i -g reshift_npm_plugin' (you will need sudo privilege as it need to access bin folder)
2. 'reshift-scan -v' to check if the installation is successful
##### Usage
1.     'reshift-scan -t <report_token> -u <host_name> -p <port_number>' to run the scan on current folder
2. 'reshift-scan -h' to see help

## Local Installation
##### Requirements
* NPM version >= 5.2.0
* git
* npx
##### Method
1. 'npm i reshift_npm_plguin'
2. 'npx node_modules/reshift_npm_plugin/ -v' to check if the installation is successful
##### Usage
1.     'npx node_modules/reshift_npm_plugin/ -t <report_token> -u <host_name> -p <port_number>' to run the scan on current folder
2. 'npx node_modules/reshift_npm_plugin/ -h' to see help


## Help
Have more questions? Feel free to [contact us](mailto:support@softwaresecursd.com)