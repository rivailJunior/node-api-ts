/* eslint-disable @typescript-eslint/ban-types */
import AuthService from "@src/services/auth"
import { authMiddleware } from "../auth";

describe('AuthMiddleWare', () => {
    test('should verify a jwt token and call the next middleware', () => {
        const jwToken = AuthService.generateToken({ data: 'fake' });
        const reqFake = {
            headers: {
                'x-access-token': jwToken
            }
        };
        const resFake = {};
        const nextFake = jest.fn();
        authMiddleware(reqFake, resFake, nextFake)
        expect(nextFake).toHaveBeenCalled()
    });

    test('should return UNAUTHORIZED if there is a problem on the token verification', () => {
        const reqFake = {
            headers: {
                'x-access-token': 'invalid token'
            }
        };
        const sendMock = jest.fn();

        const resFake = {
            status: jest.fn(() => ({
                send: sendMock
            }))
        };

        const nextFake = jest.fn();

        authMiddleware(reqFake, resFake as object, nextFake);
        expect(resFake.status).toHaveBeenCalledWith(401);
        expect(sendMock).toHaveBeenCalledWith({
            code: 401,
            error: 'jwt malformed'
        })
    })

    test('should return UNAUTHORIZED if there no token', () => {
        const reqFake = {
            headers: {}
        };
        const sendMock = jest.fn();

        const resFake = {
            status: jest.fn(() => ({
                send: sendMock
            }))
        };

        const nextFake = jest.fn();

        authMiddleware(reqFake, resFake as object, nextFake);
        expect(resFake.status).toHaveBeenCalledWith(401);
        expect(sendMock).toHaveBeenCalledWith({
            code: 401,
            error: 'jwt must be provided'
        })
    })
})