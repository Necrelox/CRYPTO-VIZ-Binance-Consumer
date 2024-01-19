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
    DB_HOST: string;
    DB_NAME: string;
    DB_PASSWORD: string;
    DB_PORT: number;
    DB_USER: string;
    COOKIE_SECRET: string;
    HOST: string;
    HTTP_PORT: number;
    NODE_ENV: string;
    ORIGINS: string[];
    PREFIX: string;
    RED_PANDA_BROKERS: string[];
    WS_PORT: number;
}

export class EnvironmentConfiguration {
    private static _instance: EnvironmentConfiguration;

    @CheckEnvVariable
    public DB_HOST: string = process.env.DB_HOST || '';

    @CheckEnvVariable
    public DB_NAME: string = process.env.DB_NAME || '';

    @CheckEnvVariable
    public DB_PASSWORD: string = process.env.DB_PASSWORD || '';

    @CheckEnvVariable
    public DB_PORT: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 0;

    @CheckEnvVariable
    public DB_USER: string = process.env.DB_USER || '';

    @CheckEnvVariable
    public COOKIE_SECRET: string = process.env.COOKIE_SECRET || '';

    @CheckEnvVariable
    public HOST: string = process.env.HOST || '';

    @CheckEnvVariable
    public HTTP_PORT: number = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 0;

    @CheckEnvVariable
    public NODE_ENV: string = process.env.NODE_ENV || '';

    public ORIGINS: string[] = process.env.ORIGINS ? process.env.ORIGINS.split(',') : [];

    public PREFIX: string = process.env.PREFIX || '';

    @CheckEnvVariable
    public RED_PANDA_BROKERS: string[] = process.env.RED_PANDA_BROKERS ? process.env.RED_PANDA_BROKERS.split(',') : [];

    @CheckEnvVariable
    public WS_PORT: number = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 0;

    public static get instance(): EnvironmentConfiguration {
        if (!EnvironmentConfiguration._instance)
            EnvironmentConfiguration._instance = new EnvironmentConfiguration();
        return EnvironmentConfiguration._instance;
    }

    public static get env(): IEnvironment {
        return EnvironmentConfiguration.instance as IEnvironment;
    }
}
