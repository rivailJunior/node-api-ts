import stormGlassWeather3HoursFixture from '@test/fixtures/stormGlass_weather_3_hours.json';
import api_forecast_response from '@test/fixtures/api_forecast_response.json';
import { Beach, BeachPosition } from '@src/models/beach';
import nock from 'nock';

describe("Beach forecast function test", () => {

	beforeEach(async () => {
		await Beach.deleteMany({});
		const defaultBeach = {
			lat: -33.792726,
			lng: 151.289824,
			name: "Manly",
			position: BeachPosition.E
		}
		const beach = new Beach(defaultBeach);
		await beach.save();
	})

	test("should return a forecast with just a few times", async () => {

		nock('https://api.stormglass.io:443', {
			encodedQueryParams: true,
			reqheaders: {
				Authorization: (): boolean => true,
			},
		})
			.defaultReplyHeaders({ 'access-control-allow-origin': '*' })
			.get('/v2/weather/point')
			.query({
				lat: '-33.792726',
				lng: '151.289824',
				params: /(.*)/,
				source: 'noaa',
			})
			.reply(200, stormGlassWeather3HoursFixture);

		const { body, status } = await global.testRequest.get('/forecast');
		expect(status).toBe(200);

		expect(body).toEqual(api_forecast_response);
	});

	it('should return 500 if something goes wrong during the processing', async () => {
		nock('https://api.stormglass.io:443', {
			encodedQueryParams: true,
			reqheaders: {
				Authorization: (): boolean => true,
			},
		})
			.defaultReplyHeaders({ 'access-control-allow-origin': '*' })
			.get('/v1/weather/point')
			.query({ lat: '-33.792726', lng: '151.289824' })
			.replyWithError('Something went wrong');

		const { status } = await global.testRequest.get(`/forecast`);

		expect(status).toBe(500);
	});
});
