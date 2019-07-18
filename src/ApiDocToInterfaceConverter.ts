import {IApiDocEndpoint} from "./ApiDocInterfaces";
import {ApiDocEndpointParser} from "./ApiDocEndpointParser";
import {InterfaceGenerator} from "./InterfaceGenerator";

export interface InterfaceMetadata {
    type: string;
    url: string;
    name: string;
    group: string;
    filename: string;
    version?: string;
    description?: string;
    title?: string;
}

interface ConverterResult {
    metadata: InterfaceMetadata;
    interface: string;
}

export class ApiDocToInterfaceConverter {

    constructor(
        private readonly interfaceGenerator: InterfaceGenerator,
        private readonly apiDocEndpoint: ApiDocEndpointParser,
    ) {
    }

    async convert(apiDocData: Array<IApiDocEndpoint>): Promise<Array<ConverterResult>> {
        return await Promise.all(apiDocData.map(async (endpoint) => ({
            metadata: endpoint as InterfaceMetadata,
            interface: await this.generateInterface(endpoint, endpoint.name),
        })));
    }

    private async generateInterface(apiDocRequest, interfaceName): Promise<string> {
        const schema = this.apiDocEndpoint.parseEndpoint(apiDocRequest);
        return await this.interfaceGenerator.createInterface(schema, interfaceName);
    }
}
