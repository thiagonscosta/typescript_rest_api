import { InternalError } from '@src/util/errors/inernal-error';
import { AxiosStatic } from 'axios';

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
  readonly windSpeed: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  waveWeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage = 'Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);
    }
}

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage = 'Unexpected error when returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);
    }
}

export class StormGlass {
  readonly params =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection';

  readonly source = 'noaa';

  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lgn: number): Promise<ForecastPoint[]> {
      try {
          const response = await this.request.get<StormGlassForecastResponse>(
            `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lgn}&params=${this.params}`
          );
          return this.normalizeResponse(response.data);

      } catch (err: any) {
          if (err.response && err.response.status) {
            throw new StormGlassResponseError(`Error: ${JSON.stringify(err.response.data)} Code: ${err.response.status}`)
          }
        throw new ClientRequestError(err.message);
      }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    //
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.source],
      swellHeight: point.swellHeight[this.source],
      swellPeriod: point.swellPeriod[this.source],
      time: point.time,
      waveDirection: point.waveDirection[this.source],
      waveWeight: point.waveHeight[this.source],
      windDirection: point.waveDirection[this.source],
      windSpeed: point.windSpeed[this.source],
    }));
  }

  // faz a verifica????o se todos os atributos de point possui a chave noaa.
  // se tiver, retorna true, se n??o tiver, retorna false
  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.source] &&
      point.swellHeight?.[this.source] &&
      point.swellPeriod?.[this.source] &&
      point.waveDirection?.[this.source] &&
      point.waveHeight?.[this.source] &&
      point.windDirection?.[this.source] &&
      point.windSpeed?.[this.source]
    );
  }
}
