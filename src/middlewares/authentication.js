import jwt from 'jsonwebtoken'
import { User } from '../../DB/models/index.js'
import { ErrorClass } from '../utils/index.js'
import { errorHandler } from './error-handling.middleware.js'

export const roles = {
    User: 'User',
    Admin: 'Admin',
    HR: 'HR'
}

const auth = (accessRoles = []) => {
    return errorHandler(async (req, res, next) => {

        const { authorization } = req.headers

        if (!authorization.startsWith(process.env.BearerKey)) {
            // return next(Error('In-valid Bearer key', { cause: 400 }))
            return next(new ErrorClass('In-valid Bearer key', 400, 'In-valid Bearer key'))
        } else {
            const token = authorization.split(process.env.BearerKey)[1]
            const decoded = jwt.verify(token, process.env.tokenSignature)
            console.log({ decoded });

            if (!decoded || !decoded.id || !decoded.isLoggedIn) {
                return next(Error('In-valid token pay load', { cause: 400 }))
            } else {
                const user = await User.findById(decoded.id).select(' userName email role ')
                if (!user) {
                    // return next(Error("user doesn't exist ", { cause: 401 }))
                    return next(new ErrorClass("user doesn't exist ", 401, "user doesn't exist "))
                } else {
                    console.log(accessRoles);
                    
                    // if (!accessRoles.includes(user.role)) {
                    //     return next(Error("not auth user ", { cause: 403 }))
                    // } else {
                        req.user = user
                        next()
                    // }
                }
            }
        }

    })
}


export {auth}