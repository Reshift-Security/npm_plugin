const config = require('../config.js');
const tmp = require('tmp');

describe("Test Configuration", () => {
    test("it should be an invalid config when project path doesn't exist", () => {
        const invalidConfig = { 'token': 'fakeToken', 'projectDir': 'nonexistent/project/folder'};
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toBeFalsy();
    });

    test("it should be an invalid configuration with token missing", () => {
        const invalidConfig = { 'projectDir': 'nonexistent/project/folder' };
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toBeFalsy();
    });

    test("it should be an invalid configuration with token missing", () => {
        const tempDirectory = tmp.dirSync();

        const validConfig = { 'token': 'arbitraryToken', 'inDir': tempDirectory.name };
        var newConfig = new config.Config(validConfig);
        expect(newConfig.isValid()).toBeTruthy();
    });
});