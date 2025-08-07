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


            if (stack) {  // use for testing - pending
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

