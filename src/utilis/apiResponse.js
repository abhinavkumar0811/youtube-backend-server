// ApiResponse - class to encapsulate API responses in a consistent structure.
export class ApiResponse{
    constructor( statusCode, data, message = 'success' ){
        
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
    }
}


