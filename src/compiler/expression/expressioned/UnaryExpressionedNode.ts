import { ts } from "../../../typescript";
import { Constructor } from "../../../types";
import { UnaryExpression } from "../UnaryExpression";
import { Node } from "../../common";

export type UnaryExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.UnaryExpression}>;

export interface UnaryExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): UnaryExpression;
}

export function UnaryExpressionedNode<T extends Constructor<UnaryExpressionedNodeExtensionType>>(Base: T): Constructor<UnaryExpressionedNode> & T {
    return class extends Base implements UnaryExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode<UnaryExpression>(this.compilerNode.expression);
        }
    };
}
