import { UserRole } from '../models/User';

export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto extends LoginDto {
    role: UserRole;
}