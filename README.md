# db-history

This library intends to help store histories for documents. Since databases like MongoDB does not keep history of changes this library can be used as a companion library to store the documents.

It uses a git repository to store things but exposes a simple API. It requires that git is installed where it runs.

## API

```javascript
async store(id : string, blob : string, user : string) => undefined

async remove(id : string, user : string) => undefined

async revisions(id : string) => array { date : string, revision : string, action : string }

async fetch(id : string, revision : string)
```
