
"use strict";

const Deferred = require("./Deferred");

class Lock {
    constructor() {
        this.requests = [];
    }

    release() {
        const first = this.requests.shift();

        if (first) {
            setImmediate(() => first.resolve());
        }
    }

    async take() {
        const last = this.requests[this.requests.length - 1];

        this.requests.push(new Deferred());

        if (last) {
            await last.promise;
        }
    }
}

module.exports = Lock;
