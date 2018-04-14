﻿import { expect } from "chai";
import * as errors from "../../errors";
import { QuoteKind } from "../../compiler";
import { StringUtils, Es5StringUtils } from "../../utils";

describe(nameof(StringUtils), () => {
    describe(nameof(StringUtils.getLineNumberFromPos), () => {
        it("should throw if providing a negative pos", () => {
            expect(() => StringUtils.getLineNumberFromPos("", -1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        it("should not throw if providing a pos the length of the string", () => {
            expect(() => StringUtils.getLineNumberFromPos("", 1)).to.not.throw();
        });

        it("should throw if providing a pos greater than the length + 1", () => {
            expect(() => StringUtils.getLineNumberFromPos("", 2)).to.throw(errors.ArgumentOutOfRangeError);
        });

        function doTest(newLineType: string) {
            let str = `testing${newLineType}this${newLineType}out`;
            const pos = str.length;
            str += `${newLineType}more and more${newLineType}and more`;
            expect(StringUtils.getLineNumberFromPos(str, pos)).to.equal(3);
        }

        it("should get the line position for the specified pos when using \r newlines", () => {
            doTest("\r");
        });

        it("should get the line position for the specified pos when using \n newlines", () => {
            doTest("\n");
        });

        it("should get the line position for the specified pos when using \r\n newlines", () => {
            doTest("\r\n");
        });

        it("should get the line position for the specified pos when right after the newline when mixing newlines", () => {
            let str = "testing\r\nthis\nout\rmore\r\nandmore\n";
            const pos = str.length;
            str += "out\r\nmore and more";
            expect(StringUtils.getLineNumberFromPos(str, pos)).to.equal(6);
        });
    });

    describe(nameof(StringUtils.escapeForWithinString), () => {
        function doTest(input: string, expected: string) {
            expect(StringUtils.escapeForWithinString(input, QuoteKind.Double)).to.equal(expected);
        }

        it("should escape the quotes and newline", () => {
            doTest(`"testing\n this out"`, `\\"testing\\\n this out\\"`);
        });
    });

    describe(nameof(StringUtils.escapeChar), () => {
        function doTest(input: string, char: string, expected: string) {
            expect(StringUtils.escapeChar(input, char)).to.equal(expected);
        }

        it("should throw when specifying a char length > 1", () => {
            expect(() => StringUtils.escapeChar("", "ab")).to.throw();
        });

        it("should throw when specifying a char length < 1", () => {
            expect(() => StringUtils.escapeChar("", "")).to.throw();
        });

        it("should escape the single quotes when specified", () => {
            doTest(`'testing "this" out'`, `'`, `\\'testing "this" out\\'`);
        });

        it("should escape regardless of if the character is already escaped", () => {
            doTest(`"testing \\"this\\" out"`, `"`, `\\"testing \\\\"this\\\\" out\\"`);
        });
    });
});

describe(nameof(Es5StringUtils), () => {
    describe(nameof(Es5StringUtils.startsWith), () => {
        function doTest(str: string, startsWith: string, expected: boolean) {
            expect(Es5StringUtils.startsWith(str, startsWith)).to.equal(expected);
        }

        it("should be true when it does", () => {
            doTest("testing", "test", true);
        });

        it("should be false when it doesn't", () => {
            doTest("testing", "test2", false);
        });
    });

    describe(nameof(Es5StringUtils.endsWith), () => {
        function doTest(str: string, endsWith: string, expected: boolean) {
            expect(Es5StringUtils.endsWith(str, endsWith)).to.equal(expected);
        }

        it("should be true when it does", () => {
            doTest("testing", "ing", true);
        });

        it("should be false when it doesn't", () => {
            doTest("testing", "3ing", false);
        });
    });
});
