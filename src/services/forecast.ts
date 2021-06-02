import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { InternalError } from './../utils/errors/internal-error';
import { StormGlass, ForecastPoint } from '@src/clients/stormGlass';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint { }

export interface TimeForecast {
    time: string;
    forecast: BeachForecast[]
}

export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string) {
        super(`Unexpected error during the forecast processing: ${ message }`);
    }
}

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) { }

    public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        try {
            const pointsWithCorrectSources: BeachForecast[] = [];
            logger.info(`Preparing the forecast for ${ beaches.length } beaches`);
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
                const enricheBeachData = this.enricheBeachData(points, beach)
                pointsWithCorrectSources.push(...enricheBeachData);
            }
            return this.mapForecastByTime(pointsWithCorrectSources);
        } catch (error) {
            logger.error(error);
            throw new ForecastProcessingInternalError(error.message)
        }

    }

    private enricheBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[] {
        return points.map((e) => ({
            ...{
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1
            },
            ...e
        }));
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = [];
        for (const point of forecast) {
            const timePoint = forecastByTime.find((f) => f.time === point.time);
            if (timePoint) {
                timePoint.forecast.push(point)
            } else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point]
                })
            }
        }
        return forecastByTime
    }
}