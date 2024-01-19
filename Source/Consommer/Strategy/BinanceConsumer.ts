import { KafkaMessage } from 'kafkajs';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { IDataConsumer } from '@/Consommer/Interface';
import { IBinanceCryptoDataDTO } from '@/Data/DTO';
import { RedPandaConsumer } from '@/Infrastructure/External/RedPanda/Consommer';
import { packageJsonConfiguration } from '@/Config';

export class BinanceConsumer implements IDataConsumer {
    private readonly _redPandaConsumer: RedPandaConsumer = RedPandaConsumer.instance;

    public async start(): Promise<void> {
        await this._redPandaConsumer.connect();
        await this._redPandaConsumer.subscribe(['binance-ws-market-data']);
        const s3: S3Client = new S3Client({
            endpoint: 'https://s3.us-west-004.backblazeb2.com',
            region: 'us-west-004',
        });

        // await this._redPandaConsumer.eachBatch(async (messages: KafkaMessage[]): Promise<void> => {
        //     if (messages.length > 0) {
        //         console.log(messages);
        //         // const rawData: IBinanceCryptoDataDTO[] = messages.map((message: KafkaMessage) => JSON.parse(message.value!.toString()).data);
        //         // await s3.send(new PutObjectCommand({
        //         //     Bucket: 'CryptoViz',
        //         //     Key: `data/${new Date().toLocaleDateString().split('/').reverse().join('-')}/${randomUUID()}.json`,
        //         //     ContentType: 'application/json',
        //         //     Metadata: {
        //         //         microservice: `${packageJsonConfiguration.name}/data`,
        //         //         timestamp: new Date().toISOString()
        //         //     },
        //         //     Body: JSON.stringify(rawData)
        //         // }));
        //     }
        // });

        await this._redPandaConsumer.eachMessage(async (message: KafkaMessage): Promise<void> => {
            const rawData: IBinanceCryptoDataDTO = JSON.parse(message.value!.toString()).data;
            await s3.send(new PutObjectCommand({
                Bucket: 'CryptoViz',
                Key: `data/${new Date().toLocaleDateString().split('/').reverse().join('-')}/${randomUUID()}.json`,
                ContentType: 'application/json',
                Metadata: {
                    microservice: `${packageJsonConfiguration.name}/data`,
                    timestamp: new Date().toISOString()
                },
                Body: JSON.stringify(rawData)
            }));
            // todo : produce to kafka event data saved (avec la Key (pour recuperezr l'objet à traiter))
        });
    }

    public async stop(): Promise<void> {
        await this._redPandaConsumer.disconnect();
    }

}
