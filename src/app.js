import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


export const app = express();

app.use(cors({
    origin: process.env.CORS_ORGIN,
    optionsSuccessStatus: 200,

}));

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());


// configure all the router file - segrigration
import userRouter from './router/user.router.js';






app.use('/Api/V1/users', userRouter)
