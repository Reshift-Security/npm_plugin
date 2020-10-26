const config = require('../config.js');
const tmp = require('tmp');

describe("Test Configuration", () => {
    test("it should be an invalid config when project path doesn't exist", () => {
        const invalidConfig = { 'token': 'fakeToken', 'projectDir': 'nonexistent/project/folder'};
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toEqual(false);
    });

    test("it should be an invalid configuration with token missing", () => {
        const invalidConfig = { 'projectDir': 'random/project/folder' };
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toEqual(false);
    });

    test("it should be a valid configuration with token and existing project direcotry", () => {
        const tempDirectory = tmp.dirSync();

        const validConfig = { 'token': 'arbitraryToken', 'projectDir': tempDirectory.name };
        var newConfig = new config.Config(validConfig);
        expect(newConfig.isValid()).toEqual(true);
    });

    test("it should be a valid configuration with token and default values", () => {
        const invalidConfig = { 'token': 'sometoken' };
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toEqual(true);
    });

    test("it should be a valid configuration with token and valid endpoint", () => {
        const invalidConfig = { 'token': 'sometoken', 'endpoint': 'http://localhost:8000' };
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toEqual(true);
    });

    test("it should be an invalid configuration with token and invalid endpoint", () => {
        const invalidConfig = { 'token': 'sometoken', 'endpoint': 'someurl' };
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toEqual(false);
    });

    test("it should be a valid configuration with token and empty endpoint to use default", () => {
        const invalidConfig = { 'token': 'sometoken', 'endpoint': '' };
        var newConfig = new config.Config(invalidConfig);
        expect(newConfig.isValid()).toEqual(true);
    });
});