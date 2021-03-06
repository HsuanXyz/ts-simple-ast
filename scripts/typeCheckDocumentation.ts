﻿import Project, { Diagnostic, SourceFile, ScriptTarget } from "ts-simple-ast";
import { getProject } from "./common";
import { MarkDownFile, CodeBlock } from "./markdown";

const errorCodes = {
    CannotRedeclareVariable: 2451,
    CannotFindModule: 2307,
    DuplicateIdentifier: 2300,
    AwaitOnlyAllowedInAsyncFunc: 1308,
    NoMultipleExportAssignments: 2309,
    ImportDeclarationConflictsWithLocalDeclaration: 2440,
    ExportAssignmentCannotBeUsedTargetingESModules: 1203
};
const errorCodesToIgnore = [errorCodes.CannotRedeclareVariable, errorCodes.CannotFindModule, errorCodes.DuplicateIdentifier,
    errorCodes.AwaitOnlyAllowedInAsyncFunc, errorCodes.NoMultipleExportAssignments, errorCodes.ImportDeclarationConflictsWithLocalDeclaration,
    errorCodes.ExportAssignmentCannotBeUsedTargetingESModules];
const project = getProject();
const docsDir = project.addExistingDirectory("./docs");
const fileSystem = project.getFileSystem();
const templatesDir = docsDir.addExistingDirectory("_script-templates");
project.addExistingSourceFiles("./docs/_script-templates/**/*.ts");
const mainTemplate = templatesDir.getSourceFileOrThrow("main.ts");
addAnyInitializers(mainTemplate);

const markDownFiles = fileSystem.glob(["./docs/**/*.md", "./README.md"]).map(filePath => new MarkDownFile(filePath, fileSystem.readFileSync(filePath)));

console.log("Checking documentation for compile errors...");
const errors: { diagnostic: Diagnostic, codeBlock: CodeBlock; }[] = [];

// much faster to get all the temporary source files first so the type checker doesn't need to be created after each manipulation
const markDownFilesWithCodeBlocks = markDownFiles
    .map((markDownFile, i) => ({
        markDownFile,
        codeBlocksWithSourceFiles: markDownFile.getCodeBlocks()
            .filter(codeBlock => !codeBlock.inline && (codeBlock.codeType === "ts" || codeBlock.codeType === "typescript"))
            .map((codeBlock, j) => ({
                tempSourceFile: templatesDir.createSourceFile(`tempFile${i}_${j}.ts`,
                    "let any = undefined as any;\n" + mainTemplate.getText() + getInitializedSetupText(codeBlock.getSetupText()) + codeBlock.text),
                codeBlock
            }))
    }));

// collect diagnostics
for (const {markDownFile, codeBlocksWithSourceFiles} of markDownFilesWithCodeBlocks) {
    for (const {codeBlock, tempSourceFile} of codeBlocksWithSourceFiles) {
        const ignoredErrorCodes = codeBlock.getIgnoredErrorCodes();
        const codeBlockDiagnostics = tempSourceFile.getDiagnostics()
            .filter(d => [...errorCodesToIgnore, ...ignoredErrorCodes].indexOf(d.getCode()) === -1);
        errors.push(...codeBlockDiagnostics.map(diagnostic => ({ diagnostic, codeBlock })));
    }
}

// output results
if (errors.length > 0) {
    for (const error of errors) {
        const messageText = error.diagnostic.getMessageText();
        console.error(`[${error.codeBlock.markdownFile.getFilePath()}:${error.codeBlock.getLineNumber()}]: ` +
            (typeof messageText === "string" ? messageText : messageText.getMessageText()) + ` (${error.diagnostic.getCode()})`);
    }

    process.exit(1);
}

function getInitializedSetupText(text: string) {
    if (text.length === 0)
        return "";

    const setupTextFile = docsDir.createSourceFile("tempSetupTextFile.ts");
    setupTextFile.insertText(0, text);
    addAnyInitializers(setupTextFile);
    text = setupTextFile.getFullText();
    setupTextFile.delete();
    return text;
}

function addAnyInitializers(file: SourceFile) {
    // prevents errors about using an unassigned variable
    for (const dec of file.getVariableDeclarations()) {
        if (dec.getInitializer() == null)
            dec.setInitializer("any");
    }
}
