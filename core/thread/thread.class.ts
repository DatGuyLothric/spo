export class Thread {
    public name;
    public data;
    public status = 'init';
    public count;

    constructor(name, data, count = 0) {
        this.name = name;
        this.data = data;
        this.count = count;
    }
}
