import { IDataConsumer } from '@/Consommer/Interface';
import { BinanceConsumer } from '@/Consommer/Strategy';

export class ConsumerManager {
    private readonly _consumers: IDataConsumer[] = [];

    constructor() {
        this._consumers = this.initializeConsumer();
    }

    private initializeConsumer(): IDataConsumer[] {
        return [
            new BinanceConsumer(),
        ];
    }

    public start(): void {
        this._consumers.forEach((consumer: IDataConsumer): void => consumer.start());
    }

    public stop(): void {
        this._consumers.forEach((consumer: IDataConsumer): void => consumer.stop());
    }
}
