import * as fs from "fs";
import * as path from "path";
import {promisify} from "util";
import {ApiDocToInterfaceConverter, ConverterResult} from "./endpoint-converter/ApiDocToInterfaceConverter";
import {ApiDocFieldsParser} from "./endpoint-parser/ApiDocFieldsParser";
import {InterfaceGenerator} from "./interface-generator/InterfaceGenerator";
import {getInterfaceWriter} from "./interfaces-writer/InterfacesWriter";

const readFile = promisify(fs.readFile);

export enum ApiDoc2InterfaceExitCode {
    SUCCESS,
    FAIL,
}

export enum ApiDoc2InterfaceGroupingMode {
    SINGLE = "single",
    URL = "url",
}

export interface ApiDoc2InterfaceResult {
    message: string;
    code: ApiDoc2InterfaceExitCode;
    warnings: Array<string>;
}

export interface ApiDoc2InterfaceParameters {
    source: string;
    output: string;
    name: string;
    grouping: ApiDoc2InterfaceGroupingMode;
}

export class ApiDoc2Interface {
    static simple(): ApiDoc2Interface {
        const generator = new InterfaceGenerator();
        const parser = new ApiDocFieldsParser();
        const converter = new ApiDocToInterfaceConverter(generator, parser);
        return new ApiDoc2Interface(converter);
    }

    constructor(
        private readonly converter: ApiDocToInterfaceConverter,
        private readonly writerFactory = getInterfaceWriter,
    ) {

    }

    async run(args: ApiDoc2InterfaceParameters): Promise<ApiDoc2InterfaceResult> {
        const warnings: Array<string> = [];
        return readFile(path.join(args.source, "api_data.json"), "utf-8")
            .then((fileData) => {
                const apiDocEndpoints = JSON.parse(fileData);
                return this.converter.convert(apiDocEndpoints);
            })
            .then((converterResults) => {
                this.fillInWarnings(converterResults, warnings);
                const writer = this.writerFactory(args.grouping);
                return writer.writeInterfaces(converterResults, args);
            })
            .then(() => ({
                warnings,
                message: "Successfully generated interfaces",
                code: ApiDoc2InterfaceExitCode.SUCCESS,
            }))
            .catch((err) => ({
                message: `${err}`,
                code: ApiDoc2InterfaceExitCode.FAIL,
                warnings: [],
            }));
    }

    private fillInWarnings(converterResults: Array<ConverterResult>, warnings: Array<string>) {
        converterResults.forEach(result => {
            if (!result.warning) {
                return;
            }

            warnings.push(`${result.metadata.name}: ${result.warning}`);
        });
    }
}
