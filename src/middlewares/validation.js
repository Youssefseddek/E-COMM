
const dataMethod = ['body', 'params', 'query', 'headers']


export const validation = (Schema) => {
    return (req, res, next) => {
        try {
// console.log(Schema.body);

            const validationArr = []
            dataMethod.forEach(key => {
                if (Schema[key]) {
                    const validationResult = Schema[key].validate(req[key], { abortEarly: false })
                    if (validationResult?.error) {
                        validationArr.push(validationResult.error.details)
                    }
                }
            })
            if (validationArr.length) {
                res.status(400).json({ message: "Validation error", validationArr })
            } else {
                return next()
            }
        } catch (error) {
            res.status(500).json({ message: "Catch error", errmsg: error.message, stack: error.stack })

        }
    }
}