import AuthService from '@src/services/auth';
import { User } from './../../src/models/users';
import { Beach } from "@src/models/beach"

describe('Beaches function tests', () => {
    const defaultUser = {
        name: 'John Doe',
        email: "john2@gmail.com",
        password: '1234'
    };
    let token: string;
    beforeEach(async () => {
        await Beach.deleteMany({});
        await User.deleteMany({})
        const user = await new User(defaultUser).save();
        token = AuthService.generateToken(user.toJSON());
    })

    describe('When creating a beach', () => {

        test('should create a beach with success', async () => {
            const newBeach = {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: 'E'
            }

            const response = await global.testRequest.post('/beaches').set({ 'x-access-token': token }).send(newBeach);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newBeach))
        });

        test('should return 422 when there is a validation error', async () => {
            const newBeach = {
                lat: 'invalid_string',
                lng: 151.289824,
                name: 'Manly',
                position: 'E'
            }

            const response = await global.testRequest.post('/beaches').set({ 'x-access-token': token }).send(newBeach);
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: 'Unprocessable Entity',
                message:
                    'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"'
            })
        });
    })
})