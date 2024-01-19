import { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';

import { IPlugin } from '@/HTTP/Interface';
import { EnvironmentConfiguration } from '@/Config';

export class CookiePlugin implements IPlugin {
    configure(app: FastifyInstance): void {
        app.register(cookie, {
            secret: EnvironmentConfiguration.env.COOKIE_SECRET
        });
    }
}
