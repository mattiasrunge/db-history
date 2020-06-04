# db-history

This library intends to help store histories for documents. Since databases like MongoDB does not keep history of changes this library can be used as a companion library to store the documents.

It uses a git repository to store things but exposes a simple API. It requires that git is installed where it runs.

## API

```javascript
const { History } = require("db-history");

const history = new History("<path to my storage folder>");

// async store(id : string, blob : object, user : string) => undefined
await history.store(123, { "my stuff": "yay" }, "me");

// async revisions(id : string) => array { date : string, revision : string, action : string }
const listOfMyStuff = await history.revisions(123);

// async fetch(id : string, revision : string) => object
const myStuff = await history.fetch(123, listOfMyStuff[0].revision);

//async remove(id : string, user : string) => undefined
await history.remove(123, "me");
```
