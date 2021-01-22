import { LexemType } from "../lexem-type.enum";

export interface IToken {
    lexem: LexemType;
    value: any;
}
