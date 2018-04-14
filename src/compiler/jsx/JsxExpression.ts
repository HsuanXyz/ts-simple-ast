import { ts, SyntaxKind } from "../../typescript";
import * as errors from "../../errors";
import { Expression } from "../expression";
import { Node } from "../common";

export class JsxExpression extends Expression<ts.JsxExpression> {
    /**
     * Gets the dot dot dot token (...) or throws if it doesn't exist.
     */
    getDotDotDotTokenOrThrow() {
        return errors.throwIfNullOrUndefined(this.getDotDotDotToken(), "Expected to find a dot dot dot token for the JSX expression.");
    }

    /**
     * Gets the dot dot dot token (...) or returns undefined if it doesn't exist.
     */
    getDotDotDotToken() {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.dotDotDotToken);
    }

    /**
     * Gets the expression or throws if it doesn't exist.
     */
    getExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find an expression for the JSX expression.");
    }

    /**
     * Gets the expression or returns undefined if it doesn't exist
     */
    getExpression() {
        return this.getNodeFromCompilerNodeIfExists<Expression>(this.compilerNode.expression);
    }
}
