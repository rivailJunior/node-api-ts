import { InternalError } from './../utils/errors/internal-error';
import { AxiosStatic } from "axios";

export interface StormGlassPointSource {
    [key: string]: number;
}
export interface StormGlassPoint {
    readonly time: string;
    readonly waveHeight: StormGlassPointSource;
    readonly waveDirection: StormGlassPointSource;
    readonly swellDirection: StormGlassPointSource;
    readonly swellHeight: StormGlassPointSource;
    readonly swellPeriod: StormGlassPointSource;
    readonly windDirection: StormGlassPointSource;
    readonly windSpeed: StormGlassPointSource;
}
export interface StormGlassForecastResponse {
    hours: StormGlassPoint[];
    waveHeight: number;
    waveDirection: number;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: number;
    windSpeed: number;
}

export interface ForecastPoint {
    time: string;
}


export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage = `Unexpected error when trying to communicate to StormGlass`;
        super(`${ internalMessage }: ${ message }`)
    }
}
export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage = `Unexpected error returned by the StormGlass service`;
        super(`${ internalMessage }: ${ message }`)
    }
}


export class StormGlass {
    readonly stormGlassAPIPrams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection';
    readonly stormGlassAPISource = 'noaa';
    constructor(protected request: AxiosStatic) { }

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        try {
            const response = await this.request.get<StormGlassForecastResponse>(`https://api.stormglass.io/v2/weather/point?params=${ this.stormGlassAPIPrams }&source=${ this.stormGlassAPISource }&end=1592113802&lat=${ lat }&lng=${ lng }`, {
                headers: {
                    Authorization: process.env.STORM_GLASS_TOKEN
                }
            })
            return this.normalizeResponse(response.data)
        } catch (err) {
            if (err.response && err.response.status) {
                throw new StormGlassResponseError(`Error: ${ JSON.stringify(err.response.data) } Code:${ err.response.status }`)
            }
            throw new ClientRequestError(err.message)
        }

    }
    private normalizeResponse(points: StormGlassForecastResponse): ForecastPoint[] {
        return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
            swellDirection: point.swellDirection[this.stormGlassAPISource],
            swellHeight: point.swellHeight[this.stormGlassAPISource],
            swellPeriod: point.swellPeriod[this.stormGlassAPISource],
            waveDirection: point.waveDirection[this.stormGlassAPISource],
            waveHeight: point.waveHeight[this.stormGlassAPISource],
            windDirection: point.windDirection[this.stormGlassAPISource],
            windSpeed: point.windSpeed[this.stormGlassAPISource],
            time: point.time
        }))
    }
    private isValidPoint(point: StormGlassPoint): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        )
    }
}