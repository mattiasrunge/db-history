
"use strict";

class Deferred {
    constructor(resolved = false) {
        this.promise = new Promise((resolve) => this.resolve = resolve);
        resolved && this.resolve();
    }
}

module.exports = Deferred;
