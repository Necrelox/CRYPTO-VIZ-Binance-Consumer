import { Knex, knex } from 'knex';
import Transaction = Knex.Transaction;

import { ErrorDatabase, ErrorDatabaseKey } from '@/Common/Error';
import { MigrationSource } from '@/Infrastructure/Database/Main/Migration';

export type { Transaction };

export interface IErrorDatabase {
    length: number;
    name: string;
    severity: string;
    code: string;
    detail: string;
    hint: string;
    position: string;
    internalPosition: string;
    internalQuery: string;
    where: string;
    schema: string;
    table: string;
    column: string;
    dataType: string;
    constraint: string;
    file: string;
    line: string;
    routine: string;
    stack: string;
    message: string;
}

export class AbstractDatabase {
    protected readonly _config: Knex.Config;
    private _database: Knex | undefined;

    protected constructor(config: Knex.Config) {
        this._config = config;
    }

    public get database(): Knex | undefined {
        return this._database;
    }

    public connect(): AbstractDatabase {
        try {
            this._database = knex(this._config);
            return this;
        } catch (error) {
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_CONNECTION_ERROR,
                detail: error
            });
        }
    }

    public disconnect(): void {
        try {
            this._database?.destroy();
        } catch (error) {
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_DISCONNECT_ERROR,
                detail: error
            });
        }
    }

    public runMigrations(): Promise<unknown> {
        if (!this._database)
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_NOT_CONNECTED
            });
        return this._database.migrate.latest({
            migrationSource: new MigrationSource()
        });
    }

    public rollbackAllMigration(): Promise<unknown> {
        if (!this._database)
            throw new ErrorDatabase({
                key: ErrorDatabaseKey.DB_NOT_CONNECTED
            });
        return this._database.migrate.rollback({
            migrationSource: new MigrationSource(),
        }, true);
    }
}
