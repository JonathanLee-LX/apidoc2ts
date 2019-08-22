import {InputData, jsonInputForTargetLanguage, quicktype, TypeScriptTargetLanguage} from "quicktype-core";
import {IApiDocEndpointPart, IApiDocExample, isEndpointPartWithExamples} from "../ApiDocInterfaces";
import {removeFieldsAligningSpaces} from "../StringUtils";

export class ApiDocExamplesParser {
    private regex = /\[(?:\[[^[]*}|[^[]*)*]|{(?:{[^{}]*}|[^{}])*}/;

    private rendererOptions = {"just-types": "true"};
    private targetLanguage = new TypeScriptTargetLanguage();

    async parse(endpointPart?: IApiDocEndpointPart, interfaceName = "Generated"): Promise<string> {
        if (!isEndpointPartWithExamples(endpointPart)) {
            return "";
        }

        const samples = this.getExamplesJson(endpointPart.examples);
        const inputData = await this.createInputData(samples, interfaceName);
        const quicktypeOptions = this.getQuicktypeOptions(inputData);

        const result = await quicktype(quicktypeOptions);
        const interfaceString = result.lines.join("\n");
        return removeFieldsAligningSpaces(interfaceString);
    }

    private getExamplesJson(examples: Array<IApiDocExample>) {
        return examples.map(example => {
            const jsonMatch = example.content.match(this.regex);
            return jsonMatch ? jsonMatch[0] : "";
        });
    }

    private getQuicktypeOptions(inputData) {
        return {
            inputData,
            lang: this.targetLanguage,
            rendererOptions: this.rendererOptions,
        };
    }

    private async createInputData(samples: Array<string>, name: string) {
        const inputData = new InputData();
        await inputData.addSource("json", {samples, name},
            () => jsonInputForTargetLanguage(this.targetLanguage));
        return inputData;
    }
}
