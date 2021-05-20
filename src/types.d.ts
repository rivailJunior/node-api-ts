import { DecodedUser } from './services/auth';
import * as http from 'http';
declare module 'express-serve-static-core' {
    export interface Request extends http.IncomingMessage, Express.Request {
        decoded?: DecodedUser;
    }
}