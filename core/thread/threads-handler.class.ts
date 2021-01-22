import { Calculator } from "../calculator/calculator.class";
import { Thread } from "./thread.class";

export class ThreadsHandler {
    public queue;

    constructor(queue) {
        this.queue = queue;
    }

    public addThread(thread) {
        this.queue.push(thread);
    }

    public run() {
        let fl = false;
        let d;
        console.log(`\n-- new thread ${ this.queue[0].name }`);
        while (this.queue.length > 0) {
            for (let i = 0; i < this.queue.length; i++) {
                if (this.queue.length === 1 && this.queue[0].data.iter >= this.queue[0].data.tokens.length) {
                    console.log(`-- close thread ${ this.queue[0].name }`);
                    this.queue.pop();
                    break;
                }
                if ((this.queue.length > 2 && i === 0) || (fl && i === 0 && this.queue.length > 1)) {
                    continue;
                }
                console.log(`-- thread ${ this.queue[i].name }`);
                const ff = this.queue[i].data.run(true, this.queue.length);
                let stat = ff[0];
                d = ff[1];
                if (stat === 'exit' && !(this.queue.length === 1 && i === 0)) {
                    console.log(`-- close thread ${ this.queue[i].name }`);
                    if (this.queue.length > 1) {
                        this.queue[0].data.addValue(d);
                        fl = true;
                    }
                    this.queue.splice(i, 1);
                    if (i + 1 >= this.queue.length)
                        break;
                } else if (stat === 'wait') {
                    this.queue[i].status = stat;
                    let sm = new Calculator(d[1], d[2], d[3]);
                    this.queue.push(new Thread(d[0].value, sm));
                    console.log(`-- new thread ${ d[0].value }`);
                }
            }
        }
        console.log('\n\nstack: ', d);
    }
}
