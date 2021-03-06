import { BaseController } from '.';

import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from './../services/forecast';
import { ClassMiddleware, Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";

const forecast = new Forecast()

@Controller("forecast")
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get("")
  public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const foreacastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(foreacastData);
    } catch (err) {
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong'
      })

    }

  }
}
