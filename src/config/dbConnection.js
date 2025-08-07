import mongoose from "mongoose";


export const dbConnection = async() =>{

    try {

        const connectionInstance = await mongoose.connect(process.env.DB_URL,{
            // useNewUrlParser: true,
            // useUnifiedTopology: true,

        })
        console.log(`DB Connected Successfully!!`)
        console.log(`DB hostName: ${connectionInstance.connection.host}`);  
        console.log(`DB port: ${connectionInstance.connection.port}`);  
        console.log(`DB name: ${connectionInstance.connection.name}`);  
        console.log(`DB connectStatus: ${connectionInstance.connection.readyState}`);  
        
    } catch (error) {
        console.log(`DB not connected:`,error);
        console.error(error.message);
        process.exit(1);
    }
}




