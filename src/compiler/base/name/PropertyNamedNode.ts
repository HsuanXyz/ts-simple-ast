import { ts } from "../../../typescript";
import { Constructor } from "../../../types";
import * as errors from "../../../errors";
import { PropertyNamedNodeStructure } from "../../../structures";
import { TypeGuards } from "../../../utils";
import { Node } from "../../common";
import { PropertyName } from "../../aliases";
import { callBaseFill } from "../../callBaseFill";
import { ReferenceFindableNode } from "./ReferenceFindableNode";

export type PropertyNamedNodeExtensionType = Node<ts.Node & { name: ts.PropertyName; }>;

export interface PropertyNamedNode extends PropertyNamedNodeSpecific, ReferenceFindableNode {
}

export interface PropertyNamedNodeSpecific {
    getNameNode(): PropertyName;
    getName(): string;
    rename(text: string): this;
}

export function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T {
    return PropertyNamedNodeInternal(ReferenceFindableNode(Base));
}

function PropertyNamedNodeInternal<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNodeSpecific> & T {
    return class extends Base implements PropertyNamedNodeSpecific {
        getNameNode() {
            return this.getNodeFromCompilerNode<PropertyName>(this.compilerNode.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        rename(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            this.global.languageService.renameNode(this.getNameNode(), text);
            return this;
        }

        fill(structure: Partial<PropertyNamedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}
