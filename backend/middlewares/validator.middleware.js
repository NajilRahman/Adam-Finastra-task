import { BadRequestError } from '../utils/appError.js';

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join('. ');
      return next(new BadRequestError(errorMessage));
    }

    req[source] = value;
    next();
  };
};

export default validate;
