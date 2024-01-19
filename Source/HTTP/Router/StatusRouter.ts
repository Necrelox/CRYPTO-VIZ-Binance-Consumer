import { FastifyInstance } from 'fastify';

import { AbstractRouter } from '@/HTTP/Router';
import { StatusHandler } from '@/HTTP/Handler';

export class StatusRouter extends AbstractRouter<StatusHandler> {
    constructor(routerPrefix: string = '/status') {
        super(new StatusHandler(), routerPrefix);
    }

    protected initRoutes(fastify: FastifyInstance): void {
        fastify.route({
            method: 'GET',
            url: '/health',
            handler: this._handler.health,
            schema: {
                tags: ['Status'],
                summary: 'Check the health of the server',
                security: []
            },
            attachValidation: true
        });
    }
}
