import { Beach, GeoPosition } from '@src/models/beach';
import { Forecast, ForecastProcessingInternalError } from './../forecast';
import stormGlassNormalized3HoursFixtures from '@test/fixtures/stormGlass_normalized_response_3_hours.json';
import { StormGlass } from '@src/clients/stormGlass';

jest.mock('@src/clients/stormGlass');

describe('forecast service', () => {
	const mockedStormService = new StormGlass() as jest.Mocked<StormGlass>;


  it('should return the forecast for mutiple beaches in the same hour with different ratings ordered by rating', async () => {
		mockedStormService.fetchPoints.mockResolvedValueOnce([
			{
				swellDirection: 123.41,
				swellHeight: 0.21,
				swellPeriod: 3.67,
				time: '2020-04-26T00:00:00+00:00',
				waveDirection: 232.12,
				waveHeight: 0.46,
				windDirection: 310.48,
				windSpeed: 100,
			},
		]);
		mockedStormService.fetchPoints.mockResolvedValueOnce([
			{
				swellDirection: 64.26,
				swellHeight: 0.15,
				swellPeriod: 13.89,
				time: '2020-04-26T00:00:00+00:00',
				waveDirection: 231.38,
				waveHeight: 2.07,
				windDirection: 299.45,
				windSpeed: 100,
			},
		]);
		const beaches: Beach[] = [
			{
				lat: -33.792726,
				lng: 151.289824,
				name: 'Manly',
				position: GeoPosition.E,
				user: 'fake-id',
			},
			{
				lat: -33.792726,
				lng: 141.289824,
				name: 'Dee Why',
				position: GeoPosition.S,
				user: 'fake-id',
			},
		];
		const expectedResponse = [
			{
				time: '2020-04-26T00:00:00+00:00',
				forecast: [
					{
						lat: -33.792726,
						lng: 141.289824,
						name: 'Dee Why',
						position: 'S',
						rating: 3,
						swellDirection: 64.26,
						swellHeight: 0.15,
						swellPeriod: 13.89,
						time: '2020-04-26T00:00:00+00:00',
						waveDirection: 231.38,
						waveHeight: 2.07,
						windDirection: 299.45,
						windSpeed: 100,
					},
					{
						lat: -33.792726,
						lng: 151.289824,
						name: 'Manly',
						position: 'E',
						rating: 2,
						swellDirection: 123.41,
						swellHeight: 0.21,
						swellPeriod: 3.67,
						time: '2020-04-26T00:00:00+00:00',
						waveDirection: 232.12,
						waveHeight: 0.46,
						windDirection: 310.48,
						windSpeed: 100,
					},
				],
			},
		];
		const forecast = new Forecast(mockedStormService);
		const beachesWithRating = await forecast.processForecastForBeaches(
			beaches
		);
		expect(beachesWithRating).toEqual(expectedResponse);
  });

  test('should return the forecast for a liost of beaches', async () => {
		mockedStormService.fetchPoints.mockResolvedValue(
			stormGlassNormalized3HoursFixtures
		);
		const beaches: Beach[] = [
			{
				lat: -33.792726,
				lng: 151.289824,
				name: 'Manly',
				position: GeoPosition.E,
				user: 'fake-id',
			},
		];
		const expectedResponse = [
			{
				time: '2020-04-26T00:00:00+00:00',
				forecast: [
					{
						lat: -33.792726,
						lng: 151.289824,
						name: 'Manly',
						position: 'E',
						rating: 2,
						swellDirection: 64.26,
						swellHeight: 0.15,
						swellPeriod: 3.89,
						time: '2020-04-26T00:00:00+00:00',
						waveDirection: 231.38,
						waveHeight: 0.47,
						windDirection: 299.45,
						windSpeed: 100,
					},
				],
			},
			{
				time: '2020-04-26T01:00:00+00:00',
				forecast: [
					{
						lat: -33.792726,
						lng: 151.289824,
						name: 'Manly',
						position: 'E',
						rating: 2,
						swellDirection: 123.41,
						swellHeight: 0.21,
						swellPeriod: 3.67,
						time: '2020-04-26T01:00:00+00:00',
						waveDirection: 232.12,
						waveHeight: 0.46,
						windDirection: 310.48,
						windSpeed: 100,
					},
				],
			},
			{
				time: '2020-04-26T02:00:00+00:00',
				forecast: [
					{
						lat: -33.792726,
						lng: 151.289824,
						name: 'Manly',
						position: 'E',
						rating: 2,
						swellDirection: 182.56,
						swellHeight: 0.28,
						swellPeriod: 3.44,
						time: '2020-04-26T02:00:00+00:00',
						waveDirection: 232.86,
						waveHeight: 0.46,
						windDirection: 321.5,
						windSpeed: 100,
					},
				],
			},
		];

		const forecast = new Forecast(mockedStormService);
		const beachesWithRating = await forecast.processForecastForBeaches(
			beaches
		);
		expect(beachesWithRating).toEqual(expectedResponse);
  });

	test('should return empty list when the beaches array is empty', async () => {
		const forecast = new Forecast();
		const response = await forecast.processForecastForBeaches([]);
		expect(response).toEqual([]);
	});

	test('should trow internal processing error when something goes wrong during rating process', async () => {
		const beaches: Beach[] = [
			{
				lat: -33.792726,
				lng: 151.289824,
				name: 'Manly',
				position: GeoPosition.E,
				user: 'fake-id',
			},
		];

		mockedStormService.fetchPoints.mockRejectedValue('Error fetching data');
		const forecast = new Forecast(mockedStormService);
		await expect(
			forecast.processForecastForBeaches(beaches)
		).rejects.toThrow(ForecastProcessingInternalError);
	});
});
