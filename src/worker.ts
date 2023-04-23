import sqlite3InitModule, { Sqlite3 } from "@sqlite.org/sqlite-wasm";


const log = (...args: string[]) => console.log(...args);
const error = (...args: string[]) => console.error(...args);
const DB_REL_PATH = "mydb.sqlite3";
const DB_PATH = `/${DB_REL_PATH}`;

type Row = {
    id: number,
    name: string,
    author: string,
};

function getDbConnection(sqlite3: Sqlite3, dbName: string) {
    return new sqlite3.oo1.OpfsDb(dbName);
}

const start = function (sqlite3: Sqlite3) {
    const db = getDbConnection(sqlite3, DB_PATH);
    try {
        db.exec("CREATE TABLE IF NOT EXISTS meta(id INTEGER PRIMARY KEY, name TEXT, author TEXT);");
    } finally {
        db.close();
    }
};

function listDb(sqlite3: Sqlite3) {
    const db = getDbConnection(sqlite3, DB_PATH);
    const rows: Row[] = [];
    try {
        db.exec({
            sql: "SELECT * FROM meta;",
            rowMode: "object",
            callback(row: Row) {
                rows.push(row);
            }
        });
    } finally {
        db.close();
    }
    postMessage({ kind: "rows", rows });
}

function addDb(sqlite3: Sqlite3, value: Omit<Row, "id">) {
    const db = getDbConnection(sqlite3, DB_PATH);
    try {
        db.exec([
            "INSERT INTO meta(id, name, author)",
            `SELECT Max(id) + 1, '${value.name}', '${value.author}' FROM meta;`
        ]);
    } finally {
        db.close();
    }
    listDb(sqlite3);
}

function deleteDb(sqlite3: Sqlite3, id: number) {
    const db = getDbConnection(sqlite3, DB_PATH);
    try {
        db.exec(`DELETE FROM meta WHERE id=${id};`);
    } finally {
        db.close();
    }
    listDb(sqlite3);
}

function resetDb(sqlite3: Sqlite3) {
    const db = getDbConnection(sqlite3, DB_PATH);
    try {
        db.exec(`DROP TABLE meta;`);
    } finally {
        db.close();
    }
    start(sqlite3);
    postMessage({ kind: "rows", rows: [] });
}

function exportDb() {
    postMessage({ kind: "file", link: DB_REL_PATH });
}

async function importDb(sqlite3: Sqlite3, inputFile: File) {
    const dir = await navigator.storage.getDirectory();
    const handle = await dir.getFileHandle(DB_REL_PATH, { create: true });
    const file = await handle.createWritable({ keepExistingData: false });
    await file.write(inputFile);
    await file.close();
    listDb(sqlite3);
}

sqlite3InitModule({
    print: log,
    printErr: error,
}).then((sqlite3: Sqlite3) => {
    try {
        start(sqlite3);
        listDb(sqlite3);
        onmessage = function (e) {
            switch (e.data.action) {
                case "refresh":
                    listDb(sqlite3);
                    break;
                case "add":
                    addDb(sqlite3, e.data.value);
                    break;
                case "delete":
                    deleteDb(sqlite3, e.data.id);
                    break;
                case "reset":
                    resetDb(sqlite3);
                    break;
                case "export":
                    exportDb();
                    break;
                case "import":
                    importDb(sqlite3, e.data.file);
                    break;
            }

        };
    } catch (err) {
        if (typeof err === "object" && err !== null && 
            "name" in err && typeof err.name === "string" && 
            "message" in err && typeof err.message === "string"
        ) {
            error(err.name, err.message);
        }
    }
});