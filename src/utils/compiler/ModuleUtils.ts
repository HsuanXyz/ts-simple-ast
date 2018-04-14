﻿import { StringUtils } from "../StringUtils";
import { Symbol, SourceFile } from "../../compiler";
import { SyntaxKind } from "../../typescript";

export class ModuleUtils {
    private constructor() {
    }

    static isModuleSpecifierRelative(text: string) {
        return StringUtils.startsWith(text, "./")
            || StringUtils.startsWith(text, "../");
    }

    static getReferencedSourceFileFromSymbol(symbol: Symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations.length === 0 || declarations[0].getKind() !== SyntaxKind.SourceFile)
            return undefined;
        return declarations[0] as SourceFile;
    }
}
