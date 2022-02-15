import { AxiosStatic } from "axios";

export interface StormGlassPointSource {
    [key: string]: number;
}

export interface StormGlassPoint {
    readonly time: string;
    readonly waveHeight: StormGlassPointSource;
    readonly waveDirection: StormGlassPointSource;
    readonly swellDirection: StormGlassPointSource;
    readonly swellPeriod: StormGlassPointSource;
    readonly windDirection: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
    hours: []
}

export class StormGlass {

    readonly params = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection';

    readonly source = 'noaaa'

    constructor(protected request: AxiosStatic) {}

    public async fetchPoints(lat: number, lgn: number): Promise<{}> {
        return this.request.get(`https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lgn}`)
    }
}