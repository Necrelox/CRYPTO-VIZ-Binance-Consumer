import { Knex } from 'knex';

export class MigrationSource implements Knex.MigrationSource<unknown> {
    private migrations = new Map<string, Knex.Migration>(
        [
        ]
    );

    public getMigrations(): Promise<string[]> {
        return Promise.resolve(Array.from(this.migrations.keys()));
    }

    public getMigrationName(migration: string): string {
        return migration;
    }

    public getMigration(migration: string): Promise<Knex.Migration> {
        return new Promise((resolve, reject): void => {
            const migrationFunctions = this.migrations.get(migration);

            if (migrationFunctions)
                resolve({
                    up: migrationFunctions.up,
                    down: migrationFunctions.down
                });
            else
                reject(new Error(`Migration not found: ${migration}`));

        });
    }
}
