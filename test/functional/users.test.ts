import { User } from '@src/models/users';
import AuthService from '@src/services/auth';

describe('User functional tests', () => {

    beforeEach(async () => {
        await User.deleteMany({});
    })
    describe('when creating a new user ', () => {
        test('should success create a new user with encrypted password', async () => {
            const newUser = {
                name: 'Jhon Doe',
                email: 'jhon@mail.com',
                password: '1234'
            }

            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining({ ...newUser, ...{ password: expect.any(String) } }));
            await expect(AuthService.comparePassword(newUser.password, response.body.password)).resolves.toBeTruthy()
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

        test('Should return 409 when the email already exists', async () => {
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

    describe('When autenticating a user', () => {
        test('should generate a token for a valid user', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };
            await new User(newUser).save();
            const response = await global.testRequest
                .post('/users/authenticate')
                .send({ email: newUser.email, password: newUser.password });

            expect(response.body).toEqual(
                expect.objectContaining({ token: expect.any(String) })
            );
        })

        test('should return UNAUTHORIZED if the user with the given email is not found', async () => {
            const response = await global.testRequest
                .post('/users/authenticate')
                .send({ email: 'some-email@mail.com', password: '123456' });

            expect(response.status).toBe(401);
        })

        test('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };
            await new User(newUser).save();
            const response = await global.testRequest
                .post('/users/authenticate')
                .send({ email: newUser.email, password: 'different password' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                code: 401,
                error: 'Password does not match'
            })
        })
    })
})