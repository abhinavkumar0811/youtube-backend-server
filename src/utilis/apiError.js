// custum error handling class 
export class ApiErrors extends Error{

    constructor(
        statusCode,
        message='something went wrong',
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode,
        this.message = message,
        this.errors = errors,
        this.stack = stack
        this.data = null,
        this.success = false
    }

    // toJSON(){
        
    //     return{
    //         statusCode: this.statusCode,
    //         message: this.message,
    //         Error: this.errors,
    //         Data: null,
    //         Succes: this.success
    //     }
    // }

   
   
}

