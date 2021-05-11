import mongoose, { Document, Model } from 'mongoose';

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
}

interface UserModel extends Omit<User, '_id'>, Document { }

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: [true, 'Email must be unique']
        },
        password: {
            type: String, required: true
        }
    }
)

export const User: Model<UserModel> = mongoose.model('User', schema)