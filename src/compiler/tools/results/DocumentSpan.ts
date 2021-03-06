import { GlobalContainer } from "../../../GlobalContainer";
import { ts } from "../../../typescript";
import { Node, SourceFile } from "../../../compiler";
import { Memoize } from "../../../utils";
import { TextSpan } from "./TextSpan";

/**
 * Document span.
 */
export class DocumentSpan<TCompilerObject extends ts.DocumentSpan = ts.DocumentSpan> {
    /** @internal */
    protected readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerObject: TCompilerObject;
    /** @internal */
    private readonly node: Node;
    /** @internal */
    private readonly sourceFile: SourceFile;

    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: TCompilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;

        // store this node so that it's start doesn't go out of date because of manipulation (though the text span may)
        this.sourceFile = this.global.compilerFactory.getSourceFileFromCacheFromFilePath(this.compilerObject.fileName)!;
        this.node = this.getSourceFile().getDescendantAtStartWithWidth(this.getTextSpan().getStart(), this.getTextSpan().getLength())!;
    }

    /**
     * Gets the compiler object.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the source file this reference is in.
     */
    getSourceFile(): SourceFile {
        return this.sourceFile;
    }

    /**
     * Gets the text span.
     */
    @Memoize
    getTextSpan() {
        return new TextSpan(this.compilerObject.textSpan);
    }

    /**
     * Gets the node at the start of the text span.
     */
    getNode() {
        return this.node;
    }
}
