import { FastifyInstance } from 'fastify';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { IPlugin } from '@/HTTP/Interface';
import { EnvironmentConfiguration } from '@/Config';

export class SwaggerUiPlugin implements IPlugin {
    configure(app: FastifyInstance): void {
        const swaggerUiOptions = {
            routePrefix: `${EnvironmentConfiguration.env.PREFIX}/swagger`,
            exposeRoute: true,
            theme: {
                title: 'Recup Plast API',
            }
        };
        app.register(fastifySwaggerUi, swaggerUiOptions);
    }
}
