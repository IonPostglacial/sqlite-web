declare module "@sqlite.org/sqlite-wasm" {
    export type TODO = any;

    export type Sqlite3 = {
        version: {
            libVersion: string,
        },
        oo1: {
            DB: new (name: string, options?: OO1DBOptions) => DB;
            OpfsDb: new (name: string, options?: OO1DBOptions) => DB;
        };
        opfs?: {
            OpfsDb: new (filename: string, mode: string) => DB;
            debug: TODO;
            deleteEntry: TODO;
            entryExists: TODO;
            metrics: TODO;
            mkdir: TODO;
            randomFilename: TODO;
            registerVfs: TODO;
            rootDirectory: TODO;
        };
        capi: {
            sqlite3_deserialize: TODO;
            [key: string]: TODO;
        };
        wasm: {
            allocFromTypedArray: (typedArray: Uint8Array) => number;
            [key: string]: TODO;
        };
    };

    /** https://sqlite.org/wasm/doc/trunk/api-oo1.md#db-ctor */
    export type OO1DBOptions = string | {
        /** @default ':memory:' */
        filename?: string;
        /** open-mode flags */
        flags?: string;
        /** name of the sqlite3_vfs to use */
        vfs?: string;
    };

    export class DB {
        filename: string;
        pointer: TODO;

        affirmOpen(): DB;
        changes(total: boolean, sixtyFour: boolean): number;
        exec(options: ExecOptions): TODO;
        exec(query: FlexibleString, options?: ExecOptions): TODO;
        close(): DB;
        export(): TODO;
        /**
         * @example aDb.prepare("INSERT INTO foo(a) VALUES(?)").bind(123).stepFinalize();
         */
        prepare(query: FlexibleString): Stmt;
        checkRc(db: TODO, resultCode: TODO);
        createFunction(): TODO;
        dbFilename(): string;
        dbName(): string;
    }

    export type ExecOptions = {
        sql?: FlexibleString;
        bind?: Bindable;
        callback?: (arg: TODO) => void;
        returnValue?: "this" | "resultRows" | "saveSql";
        rowMode?: "array" | "object" | "stmt";
        resultRows?: TODO[];
    };

    export type FlexibleString = string | Uint8Array | Int8Array | string[];

    /** https://sqlite.org/wasm/doc/trunk/api-oo1.md#stmt-properties */
    export interface Stmt {
        columnCount: number;
        parameterCount: number;
        pointer: TODO;

        bind(bindable: Bindable): Stmt;
        bind(indexOrParameterName: number | string, bindable: Bindable): Stmt;

        stepFinalize(): boolean;
    }

    export type Bindable = BindableValue[] | Record<string, BindableValue>;

    export type BindableValue =
        | null
        | undefined
        | number
        | boolean
        | string
        | Uint8Array
        | Int8Array;

    declare const sqlite3InitModule: (options: {
        print?: (...args: any[]) => void, 
        printErr?:  (...args: any[]) => void
    }) => Promise<Sqlite3>;
    export declare const InitWasm: (options: {
        print?: (...args: any[]) => void, 
        printErr?:  (...args: any[]) => void
    }) => Promise<Sqlite3>;

    export default InitWasm;
}