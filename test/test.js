"use strict";

const assert = require("assert");
const util = require("util");
const { exec } = require("child_process");
const History = require("../lib/history");

const execAsync = util.promisify(exec);

const cmd = async (cmd) => {
    const { stdout } = await execAsync(cmd);

    return stdout.replace(/\n/g, "");
};

describe("History", () => {
    let storagePath;
    let history;

    before(async () => {
        storagePath = await cmd("mktemp -d");
        history = new History(storagePath);
    });

    after(async () => {
        await cmd(`rm -rf ${storagePath}`);
    });

    it("should store a blob", async () => {
        const id = "1ab2c3d4";
        await history.store(id, "hello world", "someone");

        const revisions = await history.revisions(id);

        assert.equal(revisions.length, 1);
        assert.equal(revisions[0].user, "someone");
        assert.equal(revisions[0].action, "A");

        const blob = await history.fetch(id, revisions[0].revision);

        assert.equal(blob, "hello world");
    });

    it("should update the blob", async () => {
        const id = "1ab2c3d4";
        await history.store(id, "hey ho", "anyone");

        const revisions = await history.revisions(id);

        assert.equal(revisions.length, 2);
        assert.equal(revisions[0].user, "someone");
        assert.equal(revisions[0].action, "A");
        assert.equal(revisions[1].user, "anyone");
        assert.equal(revisions[1].action, "M");

        const blob = await history.fetch(id, revisions[1].revision);

        assert.equal(blob, "hey ho");
    });

    it("should store a second blob", async () => {
        const id = "dd7fl3f9";
        await history.store(id, "hi there", "noone");

        const revisions = await history.revisions(id);

        assert.equal(revisions.length, 1);
        assert.equal(revisions[0].user, "noone");
        assert.equal(revisions[0].action, "A");

        const blob = await history.fetch(id, revisions[0].revision);

        assert.equal(blob, "hi there");
    });


    it("should remove the blob", async () => {
        const id = "1ab2c3d4";
        await history.remove(id, "me");

        const revisions = await history.revisions(id);

        assert.equal(revisions.length, 3);
        assert.equal(revisions[0].user, "someone");
        assert.equal(revisions[0].action, "A");
        assert.equal(revisions[1].user, "anyone");
        assert.equal(revisions[1].action, "M");
        assert.equal(revisions[2].user, "me");
        assert.equal(revisions[2].action, "D");

        assert.rejects(async () => {
            await history.fetch(id, revisions[2].revision);
        });
    });

    it("should not fail if there is no change", async () => {
        const id = "1ab2c3d46j6jk";

        await history.store(id, "hello world", "someone");
        await history.store(id, "hello world", "someone");
    });
});
