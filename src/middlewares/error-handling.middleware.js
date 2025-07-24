import { ErrorClass } from "../utils/error-class.utils.js";


export const errorHandler = (API)=>{
    return (req, res, next) => {
        API(req, res, next).catch((error) => {
            console.error('Error occurred:', error);

            next(new ErrorClass(
                "Internal Server Error",
                500,
                error.data || null,
                error.message || null,
                error.stack || 'No stack trace available'
            ))

        })
    }
}


export const globaleResponse = (err,req, res, next) => {
    if (err) {
        console.error('Error:', err);
       res.status(err.status || 500).json({
            message: "Faile response",
            err_message: err.message || 'Internal Server Error',
            err_data: err.data || null,
            err_location: err.location || null,
            err_stack: err.stack || 'No stack trace available'
            
        });
    }
}