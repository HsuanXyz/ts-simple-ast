import { ts } from "../../../typescript";
import { Constructor } from "../../../types";
import { Expression } from "../Expression";
import { Node } from "../../common";

export type ExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.Expression}>;

export interface ExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): Expression;
}

export function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T {
    return class extends Base implements ExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
        }
    };
}
