import { LexemType } from '../lexer/lexem-type.enum';
import { IToken } from '../lexer/token/token.interface';

export class Synthesizer {
    public pn: IToken[] = [];
    public funcStack: any[] = [];
    public funcList: any[] = [];

    private tokens: IToken[] = [];
    private iter = 0;

    constructor() {}

    public run(tokens: IToken[]): void {
        this.tokens = tokens;
        while (this.tokens.length > this.iter) {
            switch (this.tokens[this.iter].lexem) {
                case 'IF':
                    this.pn.push({ lexem: 'IF', value: 'IF' });
                    this.pn = this.pn.concat(this.ifPn());
                    break;
                case 'WHILE':
                    this.pn.push({ lexem: 'WHILE', value: 'WHILE' });
                    this.pn = this.pn.concat(this.whilePn());
                    break;
                case 'FUNCTION':
                    this.functionPn();
                    break;
                default:
                    this.pn = this.pn.concat(this.expressionPn('EOE'));
                    break;
            }
            this.iter += 1;
        }
    }

    private ifPn(): IToken[] {
        let res: IToken[] = [];
        this.iter += 2;
        res = res.concat(this.expressionPn('RP'));
        res.push({ lexem: 'GOTO_ON_FALSE', value: '' });
        this.iter += 2;
        while (this.tokens[this.iter].lexem !== 'RB') {
            res = res.concat(this.expressionPn('EOE'));
            this.iter++;
        }
        for (let resToken of res)
            if (resToken.lexem === 'GOTO_ON_FALSE')
                resToken.value = String(this.pn.length + res.length);
        res.push({ lexem: 'GOTO_POINT', value: '' });
        this.iter++;
        if (this.tokens.length > this.iter + 1 && this.tokens[this.iter].lexem === 'ELSE') {
            this.iter += 2;
            while (this.tokens[this.iter].lexem !== 'RB') {
                res = res.concat(this.expressionPn('EOE'));
                this.iter++;
            }
        }
        for (let resToken of res)
            if (resToken.lexem === 'GOTO_POINT')
                resToken.value = String(this.pn.length + res.length - 1);
        return res;
    }

    private whilePn(): IToken[] {
        let res: IToken[] = [];
        this.iter += 2;
        res = res.concat(this.expressionPn('RP'));
        res.push({ lexem: 'GOTO_ON_FALSE', value: '' });
        this.iter += 2;
        while (this.tokens[this.iter].lexem !== 'RB') {
            res = res.concat(this.expressionPn('EOE'));
            this.iter++;
        }
        for (let resToken of res)
            if (resToken.lexem === 'GOTO_ON_FALSE')
                resToken.value = String(this.pn.length + res.length);
        res.push({ lexem: 'GOTO_POINT', value: '' });
        this.iter++;
        for (let resToken of res)
            if (resToken.lexem === 'GOTO_POINT')
                resToken.value = String(this.pn.length - 1);
        return res;
    }

    private functionPn(): void {
        let res: IToken[] = [];
        const name = this.tokens[this.iter + 1].value;
        this.funcList.push(name);
        this.funcStack.push([name, [], []]);
        this.iter += 3;
        while (this.tokens[this.iter].lexem !== 'RP') {
            this.funcStack[this.funcStack.length - 1][1].push(this.tokens[this.iter].value);
            this.iter++;
        }
        this.iter += 2;
        while(this.tokens[this.iter].lexem !== 'RB') {
            res = res.concat(this.expressionPn('EOE'));
            this.iter++;
        }
        this.funcStack[this.funcStack.length - 1][2] = res;
    }

    private expressionPn(endToken: LexemType): IToken[] {
        let res: IToken[] = [];
        let stack = [];
        let tempToken: IToken = { lexem: '', value: '' };
        let length = -1;
        while (this.tokens[this.iter].lexem !== endToken) {
            if (this.iter === length)
                stack.push(tempToken);
            if (this.funcList.filter(a => a === this.tokens[this.iter].value).length > 0) {
                this.tokens[this.iter].lexem = 'FUNC_NAME';
                tempToken = this.tokens[this.iter];
                length = this.funcStack[this.searchIndex(this.tokens[this.iter].value)][1].length + this.iter;
                this.iter++;
            }
            const lexem = this.tokens[this.iter].lexem;
            if (lexem === 'VAR' || lexem === 'DIGIT') {
                res.push(this.tokens[this.iter]);
            } else if (lexem === 'LP') {
                stack.push(this.tokens[this.iter]);
            } else if (lexem === 'RP') {
                while (stack[stack.length - 1].lexem !== 'LP') {
                    res.push(stack.pop());
                    if (stack.length === 0)
                        break;
                }
                stack.pop();
            } else {
                if (stack.length === 0) {
                    stack.push(this.tokens[this.iter]);
                } else {
                    while (this.getPriorityNumber(stack[stack.length - 1]) >= this.getPriorityNumber(this.tokens[this.iter])) {
                        res.push(stack.pop());
                        if (stack.length === 0)
                            break;
                    }
                    stack.push(this.tokens[this.iter]);
                }
            }
            this.iter++;
        }
        while (stack.length !== 0)
            res.push(stack.pop());
        return res;
    }

    private searchIndex(name: string): number {
        for (let i = 0; i < this.funcStack.length; i++)
            if (this.funcStack[i][0] === name)
                return i;
        return -1;
    }

    private getPriorityNumber(token: IToken): number {
        switch (token.value) {
            case '=':
            case '>':
            case '<':
            case '>=':
            case '<=':
            case '!=':
            case '==':
                return 1;
            case '(':
                return 2;
            case ')':
                return 3;
            case '+':
            case '-':
                return 4;
            case '/':
                return 5;
            case '*':
                return 6;
            default:
                return -1;
        }
    }
}
