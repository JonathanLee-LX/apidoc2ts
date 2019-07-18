import {ApiDocToInterfaceConverter} from "./ApiDocToInterfaceConverter";
import {InterfaceGenerator} from "./InterfaceGenerator";
import {ApiDocEndpointParser} from "./ApiDocEndpointParser";

const getRequestData = {
    type: "get",
    url: "/user/:id",
    title: "Read data of a User",
    version: "0.3.0",
    name: "GetUser",
    group: "User",
    permission: {
        name: "admin",
        title: "Admin access rights needed. ",
        description: "Permission description",
    },
    description: "<p>Interface description</p>",
    parameter: {
        fields: {
            Parameter: [
                {
                    group: "Parameter",
                    type: "string",
                    field: "id",
                    optional: false,
                    description: "<p>The Users-ID.</p>",
                },
            ],
        },
    },
    filename: "source/example_full/example.js",
};

const postRequestData = {
    type: "post",
    url: "/user",
    title: "Create a new User",
    version: "0.3.0",
    name: "PostUser",
    group: "User",
    permission: "none",
    description: "<p>Interface description</p>",
    parameter: {
        fields: {
            Parameter: [
                {
                    group: "Parameter",
                    type: "string",
                    field: "name",
                    optional: false,
                    description: "<p>Name of the User.</p>",
                },
            ],
        },
    },
    filename: "source/example_full/example.js",
};

const postRequestDataWithCustomTypes = {
    type: "post",
    url: "/user",
    title: "Create a new User",
    version: "0.3.0",
    name: "CreateUser",
    group: "User",
    permission: "none",
    description: "<p>Interface description</p>",
    parameter: {
        fields: {
            Parameter: [
                {
                    group: "Parameter",
                    type: "User",
                    field: "user",
                    optional: false,
                    description: "<p>User</p>",
                },
            ],
        },
    },
    filename: "source/example_full/example.js",
};

jest.mock("./ApiDocEndpointParser");
jest.mock("./InterfaceGenerator");

const apiDocDataFull = [getRequestData, postRequestData, postRequestDataWithCustomTypes];

const schemaMock = {type: "mock"};

describe("ApiDoc to Interface converter", () => {
    const apiDocEndpoint: ApiDocEndpointParser = new ApiDocEndpointParser();
    const parseEndpointSpy = jest.spyOn(apiDocEndpoint, "parseEndpoint");

    let interfaceGenerator: InterfaceGenerator;
    let converter: ApiDocToInterfaceConverter;

    beforeEach(() => {
        parseEndpointSpy.mockReset();
        parseEndpointSpy.mockImplementation(() => schemaMock);

        interfaceGenerator = new InterfaceGenerator(["User"]);
        converter = new ApiDocToInterfaceConverter(interfaceGenerator, apiDocEndpoint);
    });

    it("should return empty array for empty data", async () => {
        expect(await converter.convert([])).toEqual([]);
    });

    it("should call parseEndpoint with apiDoc data", async () => {
        await converter.convert([getRequestData]);
        expect(parseEndpointSpy).toBeCalledWith(getRequestData);
    });

    it("should call createInterface with parsed Schema", async () => {
        await converter.convert([getRequestData]);
        expect(interfaceGenerator.createInterface).toBeCalledWith(schemaMock, expect.anything());
    });

    it("should call createInterface with name from apiDocData", async () => {
        await converter.convert([getRequestData]);
        expect(interfaceGenerator.createInterface).toBeCalledWith(expect.anything(), getRequestData.name);
    });

    it("should call parseEndpoint and createInterface for every endpoint", async () => {
        await converter.convert(apiDocDataFull);
        expect(parseEndpointSpy).toBeCalledTimes(apiDocDataFull.length);
        expect(interfaceGenerator.createInterface).toBeCalledTimes(apiDocDataFull.length);
    });
});
