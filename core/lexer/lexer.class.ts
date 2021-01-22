import { LexemTypeEnum } from "./lexem-type.enum";
import { IToken } from "./token/token.interface";

const RANGE = 2;

export class Lexer {
    public readonly tokens: IToken[] = [];

    constructor() { }

    public start(str: string): void {
        const possibleTokens: IToken[] = [];
        const lexems: string[] = Object.keys(LexemTypeEnum);

        let value = '';
        let stopSearch = false;
        let range = 0;
        let special = false;

        for (let i = 0; i < str.length; i++) {
            stopSearch = true;
            value += str[i];

            for (let lexem of lexems) {
                if (RegExp(LexemTypeEnum[lexem]).test(value)) {
                    possibleTokens.push({ lexem: lexem as any, value: value });
                    stopSearch = false;
                    if (lexem === 'FUNCTION' || lexem === 'RETURN' || lexem === 'PRINT' || lexem === 'ELSE' || lexem === 'IF' || lexem === 'WHILE') {
                        stopSearch = true;
                        special = true;
                        break;
                    }
                }
            }

            if (stopSearch || i === str.length - 1) {
                if (possibleTokens.length !== 0) {
                    this.tokens.push(possibleTokens.pop());
                    possibleTokens.length = 0;
                    value = '';
                    if (!special && stopSearch && range != 2)
                        --i;
                    special = false;
                    continue;
                }
                range++;
                if (range == RANGE)
                    throw new Error(`No such lexem: ${ value }`);
            }
        }
    }
}
