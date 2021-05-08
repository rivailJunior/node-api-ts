import Mongoose from 'mongoose';
import { Beach } from '@src/models/beach';
import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('beaches')
export class BeachesController {
    @Post('')
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const beach = new Beach(req.body);
            const result = await beach.save();
            res.status(201).send(result);
        } catch (err) {
            if (err instanceof Mongoose.Error.ValidationError) {
                res.status(422).send({ error: err.message })
            } else {
                res.status(500).send({ error: 'internal server error' })
            }

        }

    }
}