import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/users';
import { Response } from 'express';
import mongoose from 'mongoose'
export abstract class BaseController {
    protected sendCreateUpdateErrorResponse(res: Response, error: mongoose.Error.ValidationError | Error): void {
        if (error instanceof mongoose.Error.ValidationError) {
            const clientError = this.handleClientErrors(error);
            res.status(clientError.code).send({ code: clientError.code, error: clientError.error })
        } else {
            logger.error(error)
            res.status(500).send({ code: 500, error: 'Internal Server Error' })
        }
    }

    private handleClientErrors(error: mongoose.Error.ValidationError): { code: number; error: string } {
        const duplicatedKindErrors = Object.values(error.errors).filter((err) => {
            return err.kind == CUSTOM_VALIDATION.DUPLICATED
        })
        if (duplicatedKindErrors.length) {
            return { code: 409, error: error.message }
        } else {
            return { code: 422, error: error.message }
        }
    }
}