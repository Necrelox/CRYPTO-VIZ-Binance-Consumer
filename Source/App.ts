import { Command } from 'commander';
import * as process from 'process';
import { BasaltLogger, ConsoleLoggerStrategy } from '@basalt-lab/basalt-logger';

import {
    EnvironmentConfiguration,
    I18n,
    Language,
    packageJsonConfiguration
} from '@/Config';
import { RedPandaProducer } from '@/Infrastructure/RedPanda/Producer';
import { RedPandaLoggerStrategy } from '@/Common';
import { ErrorEntity } from '@/Common/Error';
import { ConsumerManager } from '@/Consommer/ConsumerManager';

if (EnvironmentConfiguration.env.NODE_ENV === 'development')
    require('source-map-support/register');

class App {
    private readonly _consumerManager: ConsumerManager = new ConsumerManager();

    public async connectToRedPanda(): Promise<void> {
        await RedPandaProducer.instance.connect();
        BasaltLogger.addStrategy('RedPanda', new RedPandaLoggerStrategy());
        BasaltLogger.log(I18n.translate('app.redpanda.REDPANDA_PRODUCER_CONNECTED', Language.EN));
    }

    public async disconnectFromRedPanda(): Promise<void> {
        await RedPandaProducer.instance.disconnect();
        if (BasaltLogger.strategies.has('RedPanda'))
            BasaltLogger.removeStrategy('RedPanda');
        BasaltLogger.log(I18n.translate('app.redpanda.REDPANDA_PRODUCER_DISCONNECTED', Language.EN));
    }

    public runConsumer(): void {
        this._consumerManager.start();
        BasaltLogger.log(I18n.translate('app.consumer.CONSUMER_START', Language.EN));
    }

    public stopConsumer(): void {
        this._consumerManager.stop();
        BasaltLogger.log(I18n.translate('app.consumer.CONSUMER_STOP', Language.EN));
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
        });
    }

    public async stop(): Promise<void> {
        // Disconnect from brokers RedPanda
        await this.disconnectFromRedPanda();

        // Stop Consumer
        this.stopConsumer();

        BasaltLogger.log(I18n.translate('app.stop', Language.EN, {
            name: packageJsonConfiguration.name
        }));
    }
}

const commander: Command = new Command();

commander.version(packageJsonConfiguration.version, '-v, --version', 'Output the current version');

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

    // process.on('SIGINT', async (): Promise<void> => {
    //     BasaltLogger.log(I18n.translate('app.signal.SIGINT', Language.EN));
    //     await app.stop();
    //     BasaltLogger.log(I18n.translate('app.stop', Language.EN, {
    //         name: packageJsonConfiguration.name
    //     }));
    // });
});
commander.parse(process.argv);
