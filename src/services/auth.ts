import bcrypt from 'bcrypt';

export default class AuthService {
    public static async hashPassword(passord: string, salt = 10): Promise<string> {
        return await bcrypt.hash(passord, salt);
    }

    public static async comparePassword(password: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword);
    }
}

