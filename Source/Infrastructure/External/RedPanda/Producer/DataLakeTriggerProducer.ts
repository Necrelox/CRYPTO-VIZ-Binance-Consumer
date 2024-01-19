import { Topics } from '@/Infrastructure/External/RedPanda';
import { RedPandaProducer } from '@/Infrastructure/External/RedPanda/Producer';

export class DataLakeTriggerProducer {
    public async execute(key: string): Promise<void> {
        await RedPandaProducer.instance.send({
            topic: Topics.DATA_LAKE_TRIGGER,
            messages: [
                {
                    value: key
                },
            ],
        });
    }
}
