import { Command } from 'commander';
import * as process from 'process';
import { BasaltLogger, ConsoleLoggerStrategy } from '@basalt-lab/basalt-logger';

import {
    EnvironmentConfiguration,
    I18n,
    Language,
    packageJsonConfiguration
} from '@/Config';
import { HttpServerManager } from '@/HTTP/HttpServerManager';
import { RedPandaProducer } from '@/Infrastructure/External/RedPanda/Producer';
import { RedPandaLoggerStrategy } from '@/Common';
import { MainDatabase } from '@/Infrastructure/Database/Main/MainDatabase';
import { ErrorEntity } from '@/Common/Error';
import { ConsumerManager } from '@/Consommer';

if (EnvironmentConfiguration.env.NODE_ENV === 'development')
    require('source-map-support/register');

class App {
    private readonly _httpServerManager: HttpServerManager = new HttpServerManager();
    private readonly _consumerManager: ConsumerManager = new ConsumerManager();

    public async connectToRedPanda(): Promise<void> {
        await RedPandaProducer.instance.connect();
        BasaltLogger.addStrategy('RedPanda', new RedPandaLoggerStrategy());
        BasaltLogger.log(I18n.translate('app.redpanda.REDPANDA_PRODUCER_CONNECTED', Language.EN));
    }

    public connectToDatabase(): void {
        MainDatabase.instance.connect();
        BasaltLogger.log(I18n.translate('app.database.DB_CONNECTED', Language.EN));
    }

    public runConsumer(): void {
        this._consumerManager.start();
        BasaltLogger.log(I18n.translate('app.consumer.CONSUMER_START', Language.EN));
    }

    public async runHttpServer(): Promise<void> {
        await this._httpServerManager.start(EnvironmentConfiguration.env.HTTP_PORT);
        BasaltLogger.log(I18n.translate('app.httpServer.HTTP_SERVER_LISTENING', Language.EN, {
            port: EnvironmentConfiguration.env.HTTP_PORT,
            mode: EnvironmentConfiguration.env.NODE_ENV,
            prefix: EnvironmentConfiguration.env.PREFIX,
            pid: process.pid,
        }));
    }

    public async runMigrations(): Promise<void> {
        const mainDatabase: MainDatabase = MainDatabase.instance;
        const result = await mainDatabase.runMigrations();
        BasaltLogger.log({
            message: I18n.translate('app.database.DB_MIGRATIONS_RUN', Language.EN),
            result
        });
    }

    public async rollbackAllMigrations(): Promise<void> {
        const result = await MainDatabase.instance.rollbackAllMigration();
        BasaltLogger.log({
            message: I18n.translate('app.database.DB_MIGRATIONS_ROLLBACK_ALL', Language.EN),
            result
        });
    }

    public async stopHttpServer(): Promise<void> {
        await this._httpServerManager.stop();
        BasaltLogger.log(I18n.translate('app.httpServer.HTTP_SERVER_CLOSE', Language.EN));
    }

    public stopConsumer(): void {
        this._consumerManager.stop();
        BasaltLogger.log(I18n.translate('app.consumer.CONSUMER_STOP', Language.EN));
    }

    public disconnectFromDatabase(): void {
        MainDatabase.instance.disconnect();
        BasaltLogger.log(I18n.translate('app.database.DB_DISCONNECTED', Language.EN));
    }

    public async disconnectFromRedPanda(): Promise<void> {
        await RedPandaProducer.instance.disconnect();
        if (BasaltLogger.strategies.has('RedPanda'))
            BasaltLogger.removeStrategy('RedPanda');
        BasaltLogger.log(I18n.translate('app.redpanda.REDPANDA_PRODUCER_DISCONNECTED', Language.EN));
    }

    public async start(): Promise<void> {
        // Connect to brokers and initialize producer
        await this.connectToRedPanda();

        // Start Consumer
        this.runConsumer();

        BasaltLogger.log({
            message: I18n.translate('app.start', Language.EN, {
                name: packageJsonConfiguration.name
            }),
            host: EnvironmentConfiguration.env.HOST,
            prefix: EnvironmentConfiguration.env.PREFIX,
            httpPort: EnvironmentConfiguration.env.HTTP_PORT,
            wsPort: EnvironmentConfiguration.env.WS_PORT,
            dbHost: EnvironmentConfiguration.env.DB_HOST,
            dbPort: EnvironmentConfiguration.env.DB_PORT,
        });
    }

    public async stop(): Promise<void> {
        // Stop Consumer
        this.stopConsumer();

        // Disconnect from brokers RedPanda
        await this.disconnectFromRedPanda();

        BasaltLogger.log(I18n.translate('app.stop', Language.EN, {
            name: packageJsonConfiguration.name
        }));
    }
}

const commander: Command = new Command();

commander.version(packageJsonConfiguration.version, '-v, --version', 'Output the current version');

commander
    .command('migrate')
    .description('Run database migrations')
    .option('-r, --rollback', 'Rollback the last migration')
    .option('-ra, --rollback-all', 'Rollback all migrations')
    .action(async (options: {
        rollback?: boolean;
        rollbackAll?: boolean;
    }): Promise<void> => {
        const app: App = new App();
        try {
            await app.connectToRedPanda();
            BasaltLogger.addStrategy('console', new ConsoleLoggerStrategy());
            app.connectToDatabase();

            if (options.rollback)
                console.log('Rolling back the last migration');
            else if (options.rollbackAll)
                await app.rollbackAllMigrations();
            else
                await app.runMigrations();
        } catch (error) {
            if (error instanceof ErrorEntity) {
                error.message = I18n.translate(error.message, Language.EN);
                BasaltLogger.error(error);
            }
        } finally {
            setTimeout((): void => {
                process.exit(0);
            }, 300);
        }
    });

commander
    .command('seed')
    .description('Run seeders')
    .action((): void => {
        console.log('Running seeders');
        process.exit(0);
    });


commander.action(async (): Promise<void> => {
    const app: App = new App();
    try {
        BasaltLogger.addStrategy('console', new ConsoleLoggerStrategy());
        await app.start();
    } catch (error) {
        if (error instanceof ErrorEntity) {
            error.message = I18n.translate(error.message, Language.EN);
            BasaltLogger.error(error);
        }
        await app.stop();
    }
});
commander.parse(process.argv);
