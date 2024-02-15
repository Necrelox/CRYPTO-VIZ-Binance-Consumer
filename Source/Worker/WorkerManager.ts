import { IDataWorker } from '@/Worker/Interface';
import { BinanceWorker } from '@/Worker/Strategy';

export class WorkerManager {
    private readonly _worker: BinanceWorker[] = [];

    public constructor() {
        this._worker = this.initializeWorker();
    }

    private initializeWorker(): BinanceWorker[] {
        return [
            new BinanceWorker(),
        ];
    }

    public start(): void {
        this._worker.forEach((consumer: IDataWorker): void => consumer.start());
    }

    public stop(): void {
        this._worker.forEach((consumer: IDataWorker): void => consumer.stop());
    }
}
