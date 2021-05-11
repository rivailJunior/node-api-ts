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
    })
})