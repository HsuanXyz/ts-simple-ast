import { ts } from "../../typescript";
import { Node } from "../../compiler";
import { TypeGuards } from "../../utils";
import { FormattingKind } from "./FormattingKind";
import { hasBody } from "./hasBody";

export function getStatementedNodeChildFormatting(parent: Node, member: Node) {
    if (hasBody(member))
        return FormattingKind.Blankline;

    return FormattingKind.Newline;
}

export function getClausedNodeChildFormatting(parent: Node, member: Node) {
    return FormattingKind.Newline;
}
