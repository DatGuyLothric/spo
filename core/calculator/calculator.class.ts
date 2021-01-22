import { findValue } from "../utils/find-value.function";
import { operation } from "../utils/operation.function";
import { searchFunIndex } from "../utils/search-function-index.function";

export class Calculator {
    public tokens;
    public stack = [];
    public output = [];
    public functions;
    public values;
    public iter = 0;

    constructor(tokens, valueTable, funvtions) {
        this.tokens = tokens;
        this.functions = funvtions;
        this.values = valueTable;
    }

    public run() {
        while (this.iter < this.tokens.length) {
            switch (this.tokens[this.iter].lexem) {
                case 'VAR':
                case 'DIGIT':
                    this.stack.push(this.tokens[this.iter]);
                    break;
                case 'FUNC_VALUE':
                    const out = this.fnCalculate(this.tokens[this.iter].value, this.tokens[this.iter + 1], true);
                    this.iter += 2;
                    return ['wait', out];
                case 'OP':
                    console.log('op');
                    this.stack.push(this.calculate(this.tokens[this.iter]));
                    break;
                case 'ASSIGN_OP':
                    console.log('assign');
                    this.assignOp();
                    break;
                case 'COMPARISON_OP':
                    console.log('compare');
                    this.stack.push(this.calculate(this.tokens[this.iter]));
                    break;
                case 'GOTO_ON_FALSE':
                    let fl = this.stack.pop().value;
                    if (fl === false)
                        this.iter = Number(this.tokens[this.iter].value);
                    break;
                case 'GOTO_POINT':
                    this.iter = Number(this.tokens[this.iter].value);
                    break;
                default:
                    break;
            }
            if (['OP', 'ASSIGN_OP', 'COMPARISON_OP'].includes(this.tokens[this.iter].lexem) && this.iter + 2 < this.tokens.length) {
                this.iter++;
                return ['ready', []];
            }
            this.iter++;
        }
        if (this.tokens[this.tokens.length - 1].lexem !== 'RETURN') {
            return ['exit', this.values];
        } else {
            let out = this.stack.pop();
            if (out.lexem === 'VAR') {
                let v = findValue(out.value, this.values);
                return ['exit', { lexem: 'DIGIT', value: v }];
            } else {
                return ['exit', { lexem: 'DIGIT', value: out.value }];
            }
        }
    }

    private fnCalculate(fnValue, fnName, fnFl = false) {
        let funVal = [];
        let funInd = searchFunIndex(fnName.value, this.functions);
        let funTokens = this.functions[funInd][this.functions[funInd].length - 1];
        let funStack = [];
        for (let i = 0; i < fnValue.length; i++) {
            if (fnValue[i].lexem === 'VAR') {
                let e = findValue(fnValue[i].value, this.values);
                funVal.push([this.functions[funInd][1][i], e]);
            } else {
                funVal.push([this.functions[funInd][1][i], fnValue[i].value])
            }
        }
        if (fnFl)
            return [fnName, funTokens, funVal, this.functions];
        for (let i = 0; i < funTokens.length - 1; i++) {
            if (funTokens[i].lexem === 'VAR' || funTokens[i].lexem === 'DIGIT') {
                funStack.push(funTokens[i]);
            } else if (funTokens[i].lexem === 'OP') {
                let e2 = funStack.pop();
                let e1 = funStack.pop();
                if (e1.lexem === 'VAR') {
                    let ind = this.funValSearch(e1.value, funVal);
                    if (ind !== -1) {
                        e1 = funVal[ind][funVal[ind].length - 1];
                    } else {
                        e1 = findValue(e1.value, this.values);
                    }
                } else {
                    e1 = e1.value;
                }
                if (e2.lexem === 'VAR') {
                    let ind = this.funValSearch(e2.value, funVal);
                    if (ind !== -1) {
                        e2 = funVal[ind][funVal[ind].length - 1];
                    } else {
                        e2 = findValue(e2.value, this.values);
                    }
                } else {
                    e2 = e2.value;
                }
                funStack.push(operation(e1,e2,funTokens[i].value));
            } else if (funTokens[i].lexem === 'ASSIGN_OP') {
                let e2 = funStack.pop();
                let e1 = funStack.pop();
                let flag = true;
                for (let i = 0; i < funVal.length; i++) {
                    if (e1.value == funVal[i][0]) {
                        flag = false;
                        funVal[i][funVal[i].length - 1] = e2.value;
                    }
                }
                if (flag)
                    funVal.push([e1.value, e2.value]);
            } else if (funTokens[i].lexem === 'FUNC_VALUE') {
                let funct = this.fnCalculate(funTokens[i].value, funTokens[i + 1]);
                funStack.push(funct);
                i++;
            }
        }
        let out = funStack.pop();
        if (out.lexem === 'VAR') {
            let index = this.funValSearch(out.value, funVal);
            return { lexem: 'DIGIT', value: funVal[index][funVal[index].length - 1] };
        } else {
            return { lexem: 'DIGIT', value: out.value };
        }
    }   

    public addValue(value) {
        this.stack.push(value);
    }

    private funValSearch(name, list) {
        for (let i = 0; i < list.length; i++)
            if (list[i][0] === name)
                return i;
        return -1;
    }

    private calculate(oper) {
        let e2 = this.stack.pop();
        let e1 = this.stack.pop();
        console.log(e1, e2);
        if (e1.lexem === 'VAR') {
            e1 = findValue(e1.value, this.values);
        } else {
            e1 = e1.value;
        }
        if (e2.lexem === 'VAR') {
            e2 = findValue(e2.value, this.values);
        } else {
            e2 = e2.value;
        }
        return operation(e1, e2, oper.value);
    }

    private assignOp(this) {
        let e2 = this.stack.pop();
        let e1 = this.stack.pop();
        console.log(e1, e2);
        let flag = true;
        for (let i = 0; i < this.values.length; i++)
            if (e1.value === this.values[i][0]) {
                flag = false;
                this.values[i][this.values[i].length - 1] = e2.value;
            }
        if (flag)
            this.values.push([e1.value, e2.value]);
    }
}   
