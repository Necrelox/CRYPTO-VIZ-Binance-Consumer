import { FastifyRequest, FastifyReply } from 'fastify';

import { AbstractHandler } from '@/HTTP/Handler';
import { I18n } from '@/Config/I18n';

export class StatusHandler extends AbstractHandler {
    public health = (_: FastifyRequest, reply: FastifyReply): void => this.sendResponse(reply, 200, I18n.translate('http.handler.statusHandler.health', reply.request.headers['accept-language']));
}
