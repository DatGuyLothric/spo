import { IToken } from "../lexer/token/token.interface";
import { findValue } from "../utils/find-value.function";
import { operation } from "../utils/operation.function";
import { searchFunIndex } from "../utils/search-function-index.function";

export class Optimizer {
    public tokens;
    public stack = [];
    public triads = [];
    public values = [];
    public iter = 0;
    public stLst = [];
    public pn = [];
    public out = [];
    public function;

    constructor() {}

    public run(tokens: IToken[], fun, opt = true): void {
        this.tokens = tokens;
        this.function = fun;

        this.transfer();
        this.optimize();

        if (opt)
            this.redution();

        this.toPn();
        for (let value of this.values)
            value[1] = value[1].value;
    }

    private toPn(): void {
        for (let i = 0; i < this.triads.length; i++) {
            const lexem = this.triads[i][3].lexem;
            if (lexem === 'WHILE' || lexem === 'IF' || lexem === 'GOTO_ON_FALSE' || lexem === 'GOTO_POINT' || lexem === 'END') {
                this.pn.push(this.triads[i][3]);
            } else if (lexem !== 'CONST' && !this.foundTriadLink(this.triads[i])) {
                if (this.triads[i][1].lexem !== 'TR') {
                    this.pn.push(this.triads[i][1]);
                } else {
                    this.pn = this.pn.concat(this.addTriada(this.triads[i][1]));
                }
                if (this.triads[i][2].lexem !== 'TR') {
                    this.pn.push(this.triads[i][2]);
                } else {
                    this.pn = this.pn.concat(this.addTriada(this.triads[i][2]));
                }
                this.pn.push(this.triads[i][3])
            }
        }
        this.pn = this.pn.filter(a => a.lexem !== 'FUNCTION' && a.value !== 'RETURN');
        this.changeTransitions();
    }

    private changeTransitions(): void {
        this.iter = 0;
        let transitions = '';
        while (this.iter < this.pn.length) {
            if (this.pn[this.iter].lexem === 'WHILE') {
                transitions = 'WHILE';
            } else if (this.pn[this.iter].lexem === 'IF') {
                transitions = 'IF';
            }
            if (this.pn[this.iter].lexem === 'WHILE') {
                this.iter++;
                this.out = this.out.concat(this.whileTransition());
            } else if (this.pn[this.iter].lexem === 'IF') {
                this.iter++;
                this.out = this.out.concat(this.ifTransition());
            } else {
                this.out.push(this.pn[this.iter]);
            }
            this.iter++;
        }
    }

    private whileTransition(): IToken[] {
        let res: IToken[] = [];
        while (this.pn[this.iter].lexem !== 'GOTO_POINT') {
            res.push(this.pn[this.iter]);
            this.iter++;
        }
        res.push(this.pn[this.iter]);
        for (let token of res) {
            if (token.lexem === 'GOTO_ON_FALSE')
                token.value = this.out.length + res.length - 1;
            if (token.lexem === 'GOTO_POINT')
                token.value = this.out.length - 1;
        }
        return res;
    }

    private ifTransition(): IToken[] {
        let res: IToken[] = [];
        while (this.pn[this.iter].lexem !== 'GOTO_POINT') {
            res.push(this.pn[this.iter]);
            this.iter++;
        }
        for (let token of res) {
            if (token.lexem === 'GOTO_ON_FALSE')
                token.value = String(this.out.length + res.length);
        }
        res.push(this.pn[this.iter]);
        this.iter++;
        while (this.pn[this.iter].lexem !== 'END' && this.iter < this.pn.length) {
            res.push(this.pn[this.iter]);
            this.iter++;
        }
        for (let token of res) {
            if (token.lexem === 'GOTO_POINT')
                token.value = this.out.length + res.length - 1;
        }
        return res;
    }

    private indexSearch(triada: string): number {
        for (let i = 0; i < this.triads.length; i++)
            if (this.triads[i][0] === triada)
                return i;
        return -1;
    }

    private addTriada(triada: IToken, opt = true): IToken[] {
        let ind = this.indexSearch(triada.value);
        let res: IToken[] = [];
        let triadaRes = this.triads[ind];
        if (triadaRes[3].lexem === 'CONST') {
            res = [triadaRes[1]];
        } else {
            if (triadaRes[1].lexem !== 'TR') {
                res.push(triadaRes[1]);
            } else {
                res = res.concat(this.addTriada(triadaRes[1]));
            }
            if (triadaRes[2].lexem !== 'TR') {
                res.push(triadaRes[2]);
            } else {
                res = res.concat(this.addTriada(triadaRes[2]));
            }
            res.push(triadaRes[3]);
        }
        return res;
    }

    private transfer() {
        let ending = -1;
        while (this.iter < this.tokens.length) {
            if (this.iter === ending)
                this.triads.push(['^' + this.triads.length, { lexem: 'END', value: 'END' }, { lexem: 'END', value: 'END' }, { lexem: 'END', value: this.iter - 1 }]);
            switch (this.tokens[this.iter].lexem) {
                case 'VAR':
                case 'DIGIT':
                    this.stack.push(this.tokens[this.iter]);
                    break;
                case 'OP':
                case 'ASSIGN_OP':
                case 'COMPARISON_OP':
                    this.triadMaking();
                    break;
                case 'GOTO_ON_FALSE':
                    this.triads.push(['^' + this.triads.length, { lexem: 'GOTO_ON_FALSE', value: 'GOTO_ON_FALSE' }, this.tokens[this.iter], this.tokens[this.iter]]);
                    break;
                case 'GOTO_POINT':
                    this.triads.push(['^' + this.triads.length, { lexem: 'GOTO_POINT', value: 'GOTO_POINT' }, this.tokens[this.iter], this.tokens[this.iter]]);
                    ending = Number(this.tokens[this.iter].value) + 1;
                    break;
                case 'IF':
                    this.triads.push(['^' + this.triads.length, { lexem: 'IF', value: 'IF' }, this.tokens[this.iter], this.tokens[this.iter]]);
                    break;
                case 'WHILE':
                    this.triads.push(['^' + this.triads.length, { lexem: 'WHILE', value: 'WHILE' }, this.tokens[this.iter], this.tokens[this.iter]]);
                    break;
                case 'RETURN':
                    this.triads.push(['^' + this.triads.length, this.stack.pop(), this.tokens[this.iter], { lexem: 'RETURN', value: 'RETURN' }]);
                    break;
                case 'FUNC_NAME':
                    let list = [];
                    let fInd = searchFunIndex(this.tokens[this.iter].value, this.function);
                    for (let i in this.function[fInd][1])
                        list.push(this.stack.pop());
                    list.reverse();
                    this.triads.push(['^' + this.triads.length, { lexem: 'FUNC_VALUE', value: list }, this.tokens[this.iter], { lexem: 'FUNCTION', value: 'FUNCTION' }]);
                    this.stack.push({ lexem: 'TR', value: this.triads[this.triads.length - 1][0] });
            }
            this.iter++;
        }
        if (ending >= this.iter)
            this.triads.push(['^' + this.triads.length, { lexem: 'END', value: 'END' }, { lexem: 'END', value: 'END' }, { lexem: 'END', value: this.iter - 1 }]);
    }

    private triadMaking(): void {
        const el = this.stack.pop();
        this.triads.push(['^' + this.triads.length, this.stack.pop(), el, this.tokens[this.iter]]);
        this.stack.push({ lexem: 'TR', value: this.triads[this.triads.length - 1][0] });
    }

    private optimize(): void {
        let count = 0;
        let variability = true;
        while (count < this.triads.length) {
            if (this.triads[count][3].lexem === 'GOTO_ON_FALSE')
                variability = false;
            if (this.triads[count][3].lexem === 'END')
                variability = true;
            let op2 = !variability ? this.triads[count][2] : this.operandProcessing(this.triads[count][2]);
            if (this.triads[count][3].lexem === 'ASSIGN_OP') {
                if (!variability) {
                    if (this.stLst.filter(a => a === this.triads[count][1].value).length === 0)
                        this.stLst.push(this.triads[count][1].value);
                    count++;
                    continue;
                }
                this.triads[count][2] = op2;
                if (findValue(this.triads[count][1].value, this.values) === null) {
                    this.values.push([this.triads[count][1].value, op2]);
                } else {
                    let ind = findValue(this.triads[count][1].value, this.values, false);
                    this.values[ind][this.values[ind].length - 1] = op2;
                }
            } else if (this.triads[count][3].lexem === 'OP') {
                let op1 = !variability ? this.triads[count][1] : this.operandProcessing(this.triads[count][1]);
                if (op2.lexem === 'DIGIT' && op1.lexem === 'DIGIT') {
                    this.triads[count][1] = operation(op1.value, op2.value, this.triads[count][3].value);
                    this.triads[count][2] = { lexem: 'DIGIT', value: 0 };
                    this.triads[count][3] = { lexem: 'CONST', value: 'C' };
                }
            }
            count++;
        }   
    }

    private operandProcessing(triad) {
        if (triad.lexem === 'VAR') {
            let op = findValue(triad.value, this.values);
            if (op !== null && this.stLst.filter(a => a === triad.value).length === 0) {
                return { lexem: 'DIGIT', value: op.value };
            } else {
                return triad;
            }
        } else if (triad.lexem === 'TR') {
            let t = this.triads[Number(String(triad.value).slice(1))];
            if (t[3].lexem === 'CONST')
                return t[1];
            return triad;
        } else {
            return triad;
        }
    }

    private redution() {
        let count = 0;
        while (count < this.triads.length) {
            if (this.triads[count][3].lexem === 'CONST') {
                if (!this.foundTriadLink(this.triads[count], count)) {
                    this.triads.splice(count, 1);
                    count--;
                }
            } else if (this.triads[count][3].lexem === 'ASSIGN_OP' && this.triads[count][2].lexem === 'DIGIT') {
                if (this.stLst.filter(a => a === this.triads[count][1].value).length !== 0) {
                    count++;
                    continue;
                }
                let c = this.foundVar(this.triads[count], 0, count, false);
                if (c[0] && this.triads[c[1]][3].lexem === 'ASSIGN_OP' && this.triads[c[1]][2].lexem === 'DIGIT') 
                    if (!this.foundVar(this.triads[count], Number(c[1]) + 1, count)) {
                        this.triads.splice(c[1], 1);
                        count--;
                    }
                if (!this.foundVar(this.triads[count], count + 1, this.triads.length)) {
                    this.triads.splice(count, 1);
                    count--;
                }
            }
            count++;
        }
    }

    private foundVar(t, count, fin, fl = true) {
        for (let i = count; i < fin; i++) {
            if (t[1].value === this.triads[i][1].value || t[1].value === this.triads[i][2].value)
                return fl ? true : [true, i];
        }
        return fl ? false : [false, 0];
    }

    private foundTriadLink(t, count = 0) {
        for (let i = count; i < this.triads.length; i++) {
            if (t[0] === this.triads[i][1].value || t[0] === this.triads[i][2].value)
                return true;
        }
        return false;
    }
}
