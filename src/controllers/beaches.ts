import { BaseController } from '.';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
    @Post('')
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const beach = new Beach({ ...req.body, ...{ user: req.decoded?.id } });
            const result = await beach.save();
            res.status(201).send(result);
        } catch (err) {
            logger.error(err);
            this.sendCreateUpdateErrorResponse(res, err);
        }

    }
}