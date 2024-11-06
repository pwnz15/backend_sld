import { cleanEnv, str, port } from 'envalid';

export const validateEnv = () => {
    return cleanEnv(process.env, {
        MONGODB_URI: str(),
        PORT: port({ default: 5000 }),
        NODE_ENV: str({ choices: ['development', 'test', 'production'] })
    });
};