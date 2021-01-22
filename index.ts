import { Lexer } from "./core/lexer/lexer.class";
import { Parser } from "./core/parser/parser.class";
import { readFileSync } from 'fs';
import { Synthesizer } from "./core/synthesizer/synthesizer.class";
import { Optimizer } from "./core/optimizer/optimizer.class";
import { Thread } from "./core/thread/thread.class";
import { Calculator } from "./core/calculator/calculator.class";
import { ThreadsHandler } from "./core/thread/threads-handler.class";

class App {
    constructor() {}

    public run(): void {
        const path: string = process.argv[2] ? process.argv[2] : './tests/example.txt';
        const program = readFileSync(path).toString().replace(/^\/\/\s*[A-zА-я0-9(\s*)]*$/gm, '').replace(/\s/g, '');
        console.log('program: ', program);

        let lexer: Lexer = new Lexer();
        lexer.start(program);
        console.log('\n\ntokens: ', lexer.tokens);

        let parser: Parser = new Parser;
        console.log('\n\nparser result: ', parser.run(lexer.tokens) || true);

        let synthesizer: Synthesizer = new Synthesizer();
        synthesizer.run(lexer.tokens.filter(a => a.lexem !== 'COMMA'));
        console.log('\n\nsynthesizer result: ', synthesizer.pn);

        let optimizer: Optimizer = new Optimizer();
        optimizer.run(synthesizer.pn, synthesizer.funcStack);
        console.log('\n\noptimizer result: ', optimizer.out);
        console.log('\n\ntriads: ', optimizer.triads);

        console.log();

        const fun = synthesizer.funcStack;
        for (let i = 0; i < fun.length; i++) {
            let dd = new Optimizer();
            dd.run(fun[i][fun[i].length - 1], fun, false);
            fun[i][fun[i].length - 1] = dd.out;
        }

        let main = new Thread('main', new Calculator(optimizer.out, optimizer.values, fun));
        let handler = new ThreadsHandler([main]);
        handler.run();
    }
}

const app: App = new App();
app.run();
