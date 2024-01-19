import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { IPlugin, IRouter, IHook } from '@/HTTP/Interface';
import { EnvironmentConfiguration } from '@/Config';
import { StatusRouter } from '@/HTTP/Router';
import {
    CookiePlugin,
    CorsPlugin,
    FormbodyPlugin,
    HelmetPlugin,
    RateLimitPlugin,
    SwaggerPlugin,
    SwaggerUiPlugin
} from '@/HTTP/Plugin';
import { IOnRequestHttpDTO } from '@/Data/DTO';
import { OnSendHook } from '@/HTTP/Hook';
import { BasaltLogger } from '@basalt-lab/basalt-logger';

export class HttpServerManager {
    private readonly _app: FastifyInstance;
    private readonly _plugins: IPlugin[] = [];
    private readonly _routers: IRouter[] = [];
    private readonly _hooks: IHook[] = [];

    constructor() {
        this._app = fastify({
            ignoreTrailingSlash: true,
            trustProxy: true,
            ignoreDuplicateSlashes: true,
        });
        this._routers = this.initializeRouter();
        this._plugins = this.initializePlugin();
        this._hooks = this.initializeHook();
        this.initialize();
    }

    private initializeRouter(): IRouter[] {
        return [
            new StatusRouter('/status'),
        ];
    }

    private initializePlugin(): IPlugin[] {
        return [
            new CookiePlugin(),
            new CorsPlugin(),
            new FormbodyPlugin(),
            new HelmetPlugin(),
            new RateLimitPlugin(),
            new SwaggerPlugin(),
            new SwaggerUiPlugin(),
        ];
    }

    private initializeHook(): IHook[] {
        const onSendHook: OnSendHook = new OnSendHook();
        onSendHook.callback = [
            (request: FastifyRequest, reply: FastifyReply): void => {
                const data: IOnRequestHttpDTO = {
                    ip: request.headers['x-real-ip'] as string || request.ip,
                    method: request.method,
                    url: request.url,
                    statusCode: reply.statusCode,
                    createdAt: new Date(),
                };
                BasaltLogger.log(data);
            }
        ];
        return [
            onSendHook,
        ];
    }

    private initialize(): void {
        this._plugins.forEach((plugin: IPlugin) => plugin.configure(this._app));
        this._routers.forEach((router: IRouter) => router.configure(this._app, EnvironmentConfiguration.env.PREFIX));
        this._hooks.forEach((hook: IHook) => hook.configure(this._app));
    }

    public async start(port: number): Promise<string> {
        await this._app.ready();
        return this._app.listen({
            host: '0.0.0.0',
            port
        });
    }

    public async stop(): Promise<void> {
        return this._app.close();
    }
}
