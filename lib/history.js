"use strict";

const assert = require("assert");
const path = require("path");
const util = require("util");
const { exec } = require("child_process");
const { writeFile } = require("fs");

const execAsync = util.promisify(exec);
const writeFileAsync = util.promisify(writeFile);

class History {
    constructor(storagePath) {
        this.storagePath = storagePath;
    }

    async _git(...params) {
        return await execAsync(`git ${params.join(" ")}`, {
            cwd: this.storagePath
        });
    }

    async _ensureStorage() {
        try {
            await this._git("rev-parse", "--is-inside-working-tree");
        } catch {
            await this._git("init");
            await this._git("config", "user.email", "unknown");
            await this._git("config", "user.name", "unknown");
        }
    }

    async store(id, blob, user) {
        await this._ensureStorage();

        const filename = `${id}.json`;

        assert(blob);

        await writeFileAsync(path.join(this.storagePath, filename), JSON.stringify(blob, null, 2));

        await this._git("add", filename);
        await this._git("commit", "-m", `'${path.basename(filename)} updated'`, `--author='${user} <>'`);
    }

    async remove(id, user) {
        await this._ensureStorage();

        const filename = `${id}.json`;

        await this._git("rm", filename);
        await this._git("commit", "-m", `'${path.basename(filename)} updated'`, `--author='${user} <>'`);
    }

    async revisions(id) {
        await this._ensureStorage();

        const filename = `${id}.json`;

        const { stdout } = await this._git("log", "--pretty=format:'%aI %H %an'", "--name-status", "--", filename);

        return stdout.split("\n\n").map((line) => {
            const [ date, revision, user, action ] = line.replace(/\n|\t/g, " ").split(" ");

            return { date, revision, user, action };
        }).reverse();
    }

    async fetch(id, revision) {
        await this._ensureStorage();

        const filename = `${id}.json`;

        const { stdout } = await this._git("show", `${revision}:${filename}`);

        return JSON.parse(stdout);
    }
}

module.exports = History;
