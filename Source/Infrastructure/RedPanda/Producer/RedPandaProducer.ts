import { Kafka, Producer, ProducerRecord } from 'kafkajs';

import { kafkaConfiguration } from '@/Config';
import { ErrorInfrastructure, ErrorInfrastructureKey } from '@/Common/Error';

export class RedPandaProducer {
    private static _instance: RedPandaProducer;
    private readonly _kafka: Kafka;
    private readonly _producer: Producer;
    private _isConnected: boolean = false;

    private constructor() {
        this._kafka = new Kafka(kafkaConfiguration);
        this._producer = this._kafka.producer();
    }

    public static get instance(): RedPandaProducer {
        if (!RedPandaProducer._instance)
            RedPandaProducer._instance = new RedPandaProducer();
        return RedPandaProducer._instance;
    }

    public async connect(): Promise<void> {
        try {
            this._isConnected = true;
            await this._producer.connect();
        } catch (error) {
            throw new ErrorInfrastructure({
                key: ErrorInfrastructureKey.KAFKA_PRODUCER_CONNECTION_ERROR,
                detail: error
            });
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this._producer.disconnect();
            this._isConnected = false;
        } catch (error) {
            throw new ErrorInfrastructure({
                key: ErrorInfrastructureKey.KAFKA_PRODUCER_DISCONNECT_ERROR,
                detail: error
            });
        }
    }

    public async send(record: ProducerRecord): Promise<void> {
        try {
            if (!this._isConnected)
                throw new ErrorInfrastructure({
                    key: ErrorInfrastructureKey.KAFKA_PRODUCER_IS_NOT_CONNECTED
                });
            await this._producer.send(record);
        } catch (error) {
            if (!this._isConnected)
                throw new ErrorInfrastructure({
                    key: ErrorInfrastructureKey.KAFKA_PRODUCER_IS_NOT_CONNECTED
                });
            throw new ErrorInfrastructure({
                key: ErrorInfrastructureKey.KAFKA_PRODUCER_SEND_ERROR,
                detail: error
            });
        }
    }
}
