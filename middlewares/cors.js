import cors from 'cors';

const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://movies.com'
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
    origin: (origin, callback) => {
        if (acceptedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (!origin) {
            return callback(null, true);
        }
        return callback(new Error('CORS not allowed'));
    }
});