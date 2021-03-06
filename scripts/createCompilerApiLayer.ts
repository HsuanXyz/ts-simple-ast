﻿/**
 * Code generation: Create Compiler API Layer
 * ------------------------------------------
 * This creates a file that contains the typings from the TypeScript compiler API.
 * ------------------------------------------
 */
import * as path from "path";
import { rootFolder } from "./config";
import { InspectorFactory } from "./inspectors";
import { UnionTypeNode } from "ts-simple-ast";
import { ArrayUtils } from "../src/utils";
import { cloneEnums, cloneInterfaces, cloneTypeAliases, cloneClasses, cloneFunctions, cloneVariables, cloneNamespaces } from "./common/cloning";

const enumsToSeparate = ["SyntaxKind", "ScriptTarget", "ScriptKind", "LanguageVariant", "EmitHint", "JsxEmit", "ModuleKind", "ModuleResolutionKind",
    "NewLineKind", "TypeFlags", "ObjectFlags", "SymbolFlags", "TypeFormatFlags", "DiagnosticCategory", "IndentStyle"];
const interfacesToSeparate = ["CompilerOptions", "MapLike", "EditorSettings"];
const typeAliasesToSeparate: string[] = [];

export function createCompilerApiLayer(factory: InspectorFactory) {
    const tsInspector = factory.getTsInspector();
    const project = factory.getProject();
    const declarationFile = tsInspector.getDeclarationFile();

    const tsNamespaces = declarationFile.getNamespaces().filter(n => n.getName() === "ts");
    const allEnums = ArrayUtils.flatten(tsNamespaces.map(n => n.getEnums()));
    const allInterfaces = ArrayUtils.flatten(tsNamespaces.map(n => n.getInterfaces()));
    const allTypeAliases = ArrayUtils.flatten(tsNamespaces.map(n => n.getTypeAliases()));

    createTsSourceFile();

    function createTsSourceFile() {
        const sourceFile = getOrCreateSourceFile("typescript.ts");

        sourceFile.addImportDeclarations([{
            namespaceImport: "tsCompiler",
            moduleSpecifier: "typescript"
        }, {
            namedImports: ["ObjectUtils"],
            moduleSpecifier: sourceFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/utils/ObjectUtils.ts"))
        }]);

        addSeparatedDeclarations();

        const tsNamespace = sourceFile.addNamespace({
            name: "ts",
            isExported: true
        });

        addEnumExports();

        cloneNamespaces(tsNamespace, ArrayUtils.flatten(tsNamespaces.map(n => n.getNamespaces())));
        cloneInterfaces(tsNamespace, allInterfaces.filter(i => interfacesToSeparate.indexOf(i.getName()) === -1));
        cloneEnums(tsNamespace, allEnums.filter(e => enumsToSeparate.indexOf(e.getName()) === -1));
        cloneTypeAliases(tsNamespace, allTypeAliases.filter(t => typeAliasesToSeparate.indexOf(t.getName()) === -1));
        cloneClasses(tsNamespace, ArrayUtils.flatten(tsNamespaces.map(n => n.getClasses())));
        cloneFunctions(tsNamespace, ArrayUtils.flatten(tsNamespaces.map(n => n.getFunctions())));
        cloneVariables(tsNamespace, ArrayUtils.flatten(tsNamespaces.map(n => n.getVariableStatements())));

        tsNamespace.getInterfaceOrThrow("Node").addProperty({
            docs: [{
                description: "This brand prevents using nodes not created within this library or not created within the ts namespace object of this library.\n" +
                    "It's recommended that you only use this library and use its ts named export for all your TypeScript compiler needs.\n" +
                    "If you want to ignore this and are using the same TypeScript compiler version as ts.versionMajorMinor then assert it to ts.Node.\n" +
                    "If you don't use this library with this same major & minor version of TypeScript then be warned, you may encounter unexpected behaviour."
            }],
            name: "_tsSimpleAstBrand",
            type: "undefined"
        });

        sourceFile.insertStatements(0, writer => {
            writer.writeLine("/* tslint:disable */")
                .writeLine("/*")
                .writeLine(" * TypeScript Compiler Declaration File")
                .writeLine(" * ====================================")
                .writeLine(" * DO NOT EDIT - This file is automatically generated by createCompilerApiLayer.ts")
                .writeLine(" *")
                .writeLine(" * This file contains the TypeScript compiler declarations slightly modified.")
                .writeLine(" * Note: The TypeScript compiler is licensed under the Apache 2.0 license.")
                .writeLine(" */");
        });

        tsNamespace.addStatements(writer => {
            writer.newLine();
            writer.writeLine("// overwrite this namespace with the TypeScript compiler");
            writer.write("ObjectUtils.assign((ts as any), tsCompiler);");
        });

        sourceFile.replaceWithText(sourceFile.getFullText().replace(/ *\r?\n/g, "\r\n").replace(/(\r\n)+$/, "\r\n"));

        function addSeparatedDeclarations() {
            for (const enumDec of allEnums.filter(e => enumsToSeparate.indexOf(e.getName()) >= 0))
                cloneEnums(sourceFile, [enumDec]).forEach(e => e.setHasDeclareKeyword(true).setIsExported(false));

            for (const interfaceDec of allInterfaces.filter(i => interfacesToSeparate.indexOf(i.getName()) >= 0))
                cloneInterfaces(sourceFile, [interfaceDec]);

            for (const typeAliasDec of allTypeAliases.filter(t => typeAliasesToSeparate.indexOf(t.getName()) >= 0))
                cloneTypeAliases(sourceFile, [typeAliasDec]);

            // todo: need a better way of doing this in the future...
            const returnTypeNode = sourceFile.getInterfaceOrThrow("CompilerOptions").getIndexSignatures()[0].getReturnTypeNode() as UnionTypeNode;
            returnTypeNode.getTypeNodes().map(n => {
                if (n.getText() === "CompilerOptionsValue" || n.getText() === "JsonSourceFile")
                    n.replaceWithText(`ts.${n.getText()}`);
            });
        }

        function addEnumExports() {
            const filteredEnums = allEnums.filter(e => enumsToSeparate.indexOf(e.getName()) >= 0);
            sourceFile.addStatements(writer => {
                writer.newLine();
                writer.writeLine("// this is a trick to get the enums defined in the local scope by their name, but have the compiler");
                writer.writeLine("// understand this as exporting the ambient declarations above (so it works at compile time and run time)");
                writer.writeLine("// @ts-ignore: Implicit use of this.");
                writer.writeLine("const tempThis = this as any;");
                for (let i = 0; i < filteredEnums.length; i++) {
                    const enumName = filteredEnums[i].getName();
                    writer.writeLine(`tempThis["${enumName}"] = tsCompiler.${enumName};`);
                }
                writer.blankLine();

                writer.write(`export `).inlineBlock(() => {
                    for (let i = 0; i < filteredEnums.length; i++) {
                        const enumName = filteredEnums[i].getName();
                        if (i > 0)
                            writer.write(",").newLine();
                        writer.write(`${enumName}`);
                    }
                }).write(";");
            });
        }
    }

    function getOrCreateSourceFile(fileName: string) {
        const filePath = path.join(rootFolder, "src/typescript", fileName);
        const existingSourceFile = project.getSourceFile(filePath);
        if (existingSourceFile != null)
            existingSourceFile.removeText();
        return existingSourceFile || project.createSourceFile(filePath);
    }
}
