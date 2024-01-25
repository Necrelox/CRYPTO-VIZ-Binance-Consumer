import * as process from 'process';

import { ErrorConfig, ErrorConfigKey } from '@/Common/Error';

function CheckEnvVariable(target: unknown, propertyKey: string): void {
    const value: string | undefined = process.env[propertyKey];
    if (!value)
        throw new ErrorConfig({
            key: `${propertyKey.toUpperCase()}_NOT_FOUND` as ErrorConfigKey
        });
}

export interface IEnvironment {
    NODE_ENV: string;

    //////// REDPANDA //////
    RED_PANDA_BROKERS: string[];
    ////////////////////////

    ///////// AWS //////////
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    ////////////////////////

}

export class EnvironmentConfiguration {
    private static _instance: EnvironmentConfiguration;

    @CheckEnvVariable
    public NODE_ENV: string = process.env.NODE_ENV || '';

    //////// REDPANDA //////
    @CheckEnvVariable
    public RED_PANDA_BROKERS: string[] = process.env.RED_PANDA_BROKERS ? process.env.RED_PANDA_BROKERS.split(',') : [];
    ////////////////////////

    ///////// AWS //////////
    @CheckEnvVariable
    public AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID || '';

    @CheckEnvVariable
    public AWS_SECRET_ACCESS_KEY: string = process.env.AWS_SECRET_ACCESS_KEY || '';
    ////////////////////////

    public static get instance(): EnvironmentConfiguration {
        if (!EnvironmentConfiguration._instance)
            EnvironmentConfiguration._instance = new EnvironmentConfiguration();
        return EnvironmentConfiguration._instance;
    }

    public static get env(): IEnvironment {
        return EnvironmentConfiguration.instance as IEnvironment;
    }
}
