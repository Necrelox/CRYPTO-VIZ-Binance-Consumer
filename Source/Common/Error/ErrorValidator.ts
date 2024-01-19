import { ErrorEntity } from '@/Common/Error';

export enum ErrorValidatorKey {
}

const ErrorValidatorKeyCode: { [p: string]: number } = {
};

export class ErrorValidator extends ErrorEntity {
    constructor(e: {
        key: string,
        detail?: unknown,
        interpolation?: { [key: string]: unknown }
    }) {
        super({
            code: ErrorValidatorKeyCode[e.key],
            messageKey: `error.errorValidator.${e.key}`,
            detail: e.detail,
            interpolation: e.interpolation,
        });
    }
}
