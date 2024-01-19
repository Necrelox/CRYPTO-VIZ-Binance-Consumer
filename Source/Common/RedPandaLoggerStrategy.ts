import { ILoggerStrategy, LogLevels } from '@basalt-lab/basalt-logger';

import { LoggerProducer } from '@/Infrastructure/External/RedPanda/Producer';

export class RedPandaLoggerStrategy implements ILoggerStrategy {
    public log(level: LogLevels, date: Date, object: unknown): void {
        const producer: LoggerProducer = new LoggerProducer();
        producer.execute(level, date.toISOString(), object)
            .catch((error: Error): void => {
                throw error;
            });
    }
}
