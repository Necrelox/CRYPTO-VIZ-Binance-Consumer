import { RedPandaProducer } from '@/Infrastructure/RedPanda/Producer';
import { Topics } from '@/Infrastructure/RedPanda';
import { packageJsonConfiguration } from '@/Config';
import { IBinanceCryptoDataDTO } from '@/Data/DTO';

export class BinanceProducer {
    public async execute(data: IBinanceCryptoDataDTO): Promise<void> {
        await RedPandaProducer.instance.send({
            topic: Topics.BINANCE_CONSUMER,
            messages: [
                {
                    value: JSON.stringify({
                        microservice: packageJsonConfiguration.name,
                        data,
                    }),
                },
            ],
        });
    }
}
