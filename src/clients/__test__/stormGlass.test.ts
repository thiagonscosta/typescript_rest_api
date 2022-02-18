import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_weather_3_hours_normalized.json';

jest.mock('axios');

describe('StormGlass client', () => {
    
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  it('Should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get = jest
      .fn()
      .mockReturnValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toBe(stormGlassNormalized3HoursFixture);
  });

  it("should get a generic error from StormGlass service when the request fail before reaching the service", async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
        'Unexpected error when trying to communicate to StormGlass: Network Error'
    )
  })

  it("should get an StormGlassResponseError when the StormGlass service responds with error", async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({
        response: {
            status: 429,
            data: { errors: ['Rate Limit reached'] },
        },
    });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
        'Unexpected error when returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    )
  })
});
