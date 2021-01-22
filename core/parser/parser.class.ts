import { LexemType } from "../lexer/lexem-type.enum";
import { IToken } from "../lexer/token/token.interface";

export class Parser {
    private tokens: IToken[];
    private iter = 0;

    constructor() {}

    public run(tokens: IToken[]): boolean {
        this.tokens = tokens;
        while (this.iter < this.tokens.length)
            if (!this.expression())
                return false;
        return true;
    }

    private expression(): boolean {
        let tempIter = this.iter;
        const callback = () => { this.iter = tempIter; return false; };
        return (this.assignExpression() || this.conditionalExpression() || this.loopExpression() || this.print() || this.functionExpression())
            ? true
            : callback();
    }

    private assignExpression(): boolean {
        let tempIter = this.iter;
        const callback = () => { this.iter = tempIter; return false; };
        return (!this.var() || !this.assignOperation() || !this.arithmeticalExpression() || !this.eoe())
            ? callback()
            : true;
    }

    private conditionalExpression(): boolean {
        let tempIter = this.iter;
        if (!this.ifKey() || !this.lp() || !this.logicalExpression() || !this.rp() || !this.lb()) {
            this.iter = tempIter;
            return false;
        }
        while (this.expression()) { }
        if (!this.rb()) {
            this.iter = tempIter;
            return false;
        }
        while (true) {
            if (!this.elseKey()) 
                return true;
            if (!this.lb()){
                this.iter = tempIter;
                return false;
            }
            while (this.expression()) { }
            if (!this.rb()) {
                this.iter = tempIter;
                return false;
            }
        }
    }

    private loopExpression(): boolean {
        let tempIter = this.iter;
        if (!this.whileKey() || !this.lp() || !this.logicalExpression() || !this.rp() || !this.lb()) {
            this.iter = tempIter;
            return false;
        }
        while (this.expression()) { }
        if (!this.rb()) {
            this.iter = tempIter;
            return false;
        }
        return true;
    }

    private print(): boolean {
        let tempIter = this.iter;
        const callback = () => { this.iter = tempIter; return false; };
        return (!this.printKey() || !this.lp() || !this.arithmeticalExpression() || !this.rp() || !this.eoe())
            ? callback()
            : true;
    }

    private functionExpression(): boolean {
        let tempIter = this.iter;
        if (!this.functionKey() || !this.var() || !this.lp() || !this.functionParams() || !this.rp() || !this.lb()) {
            this.iter = tempIter;
            return false;
        }
        while (this.expression()) { }
        if (!this.returnKey() || !this.value() || !this.eoe() || !this.rb()) {
            this.iter = tempIter;
            return false;
        }
        return true;
    }

    private functionParams(): boolean {
        let tempIter = this.iter;
        if (this.tokens[this.iter].lexem === 'VAR') {
            if (!this.var()) {
                this.iter = tempIter;
                return false;
            }
            tempIter = this.iter;
            while (this.tokens[this.iter].lexem === 'COMMA') {
                this.iter++;
                if (!this.var()) {
                    this.iter = tempIter;
                    return false;
                }
            }
        }   
        return true;
    }

    private arithmeticalExpression(): boolean {
        let tempIter = this.iter;
        if (!this.value())
            return false;
        while (true) {
            if (!this.operation())
                return true;
            if (!this.value()) {
                this.iter = tempIter;
                return false;
            }
        }
    }

    private value(): boolean {
        let tempIter = this.iter;
        const callback = () => { this.iter = tempIter; return false; };
        return (this.var() || this.digit() || this.parenthesesExpression())
            ? true
            : callback();
    }

    private parenthesesExpression(): boolean {
        let tempIter = this.iter;
        const callback = () => { this.iter = tempIter; return false; };
        return (!this.lp() || !this.arithmeticalExpression() || !this.rp())
            ? callback()
            : true;
    }

    private logicalExpression(): boolean {
        let tempIter = this.iter;
        const callback = () => { this.iter = tempIter; return false; };
        return (!this.arithmeticalExpression() || !this.comparisonOperation() || !this.arithmeticalExpression())
            ? callback()
            : true;
    }

    private var(): boolean {
        return this.match('VAR');
    }

    private digit(): boolean {
        return this.match('DIGIT');
    }

    private lp(): boolean {
        return this.match('LP');
    }

    private rp(): boolean {
        return this.match('RP');
    }

    private operation(): boolean {
        return this.match('OP');
    }

    private assignOperation(): boolean {
        return this.match('ASSIGN_OP');
    }

    private comparisonOperation(): boolean {
        return this.match('COMPARISON_OP');
    }

    private rb(): boolean {
        return this.match('RB');
    }

    private lb(): boolean {
        return this.match('LB');
    }

    private ifKey(): boolean {
        return this.match('IF');
    }

    private elseKey(): boolean{
        return this.match('ELSE');
    }

    private whileKey(): boolean {
        return this.match('WHILE');
    }

    private printKey(): boolean {
        return this.match('PRINT');
    }

    private returnKey(): boolean {
        return this.match('RETURN');
    }

    private functionKey(): boolean {
        return this.match('FUNCTION');
    }

    private eoe(): boolean {
        return this.match('EOE');
    }

    private match(lexem: LexemType): boolean {
        const callback = () => { this.iter++; return true; };
        return this.iter >= this.tokens.length
            ? false
            : (this.tokens[this.iter].lexem === lexem
                ? callback()
                : false
            );
    }
}
