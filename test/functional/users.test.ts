import { User } from '@src/models/users';
describe('User functional tests', () => {

    beforeEach(async () => {
        await User.deleteMany({});
    })
    describe('when creating a new user ', () => {
        test('should success create a new user', async () => {
            const newUser = {
                name: 'Jhon Doe',
                email: 'jhon@mail.com',
                password: '1234'
            }

            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newUser));
        });

        test('should return 422 when there is a validation error', async () => {
            const newUser = {
                email: 'jhon@mail.com',
                password: '1234'
            }

            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.'
            });
        });

        it('Should return 409 when the email already exists', async () => {
            const newUser = {
                name: 'Jhon Doe',
                email: 'jhon@mail.com',
                password: '1234'
            }

            await global.testRequest.post('/users').send(newUser);
            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: 'User validation failed: email: already exists in the database.'
            });
        })
    });
})