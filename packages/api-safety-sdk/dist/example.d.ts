import { User } from './schemas';
import { Result } from './result';
import { AppError } from './errors';
export declare function getUser(userId: number): Promise<Result<User, AppError>>;
export declare function createUser(input: Pick<User, 'name' | 'email'>): Promise<Result<User, AppError>>;
