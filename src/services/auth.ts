import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

export default class AuthService {
    public static async hashPassword(passord: string, salt = 10): Promise<string> {
        return await bcrypt.hash(passord, salt);
    }

    public static async comparePassword(password: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public static generateToken(payload: object): string {
        return jwt.sign(payload, config.get('App.auth.key'), { expiresIn: config.get('App.auth.tokenExpiresIn') })
    }
}

