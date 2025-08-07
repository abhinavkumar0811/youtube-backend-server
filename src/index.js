import dotenv from 'dotenv';
import express from 'express';
import { dbConnection } from './config/dbConnection.js';
import { app } from './app.js';

const port = process.env.PORT || 8004;


dotenv.config({
    path: './env'    // it will load all the enviroment from the .env file
})

dbConnection()
          .then(() =>{

            app.listen(port, () =>{
                console.log(`app started successfully on port: ${port}`);
            })

          })
          .catch((error) =>{
            console.log(`app not started error:`, error);
          })
