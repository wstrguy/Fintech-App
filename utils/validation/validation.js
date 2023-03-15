// Importing joi
const Joi = require("joi")
// wrapper function
const validateRequest = (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }
      if (!req.value) {
        req.value = {}; // create an empty object the request value doesn't exist yet
      }
      req.value["body"] = req.body;
      next();
    };
  };


    const schemas = {
    signupSchema: Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2, tlds: {allow: ["com", "org", "net"]}})
        .required(),
    password: Joi.string()
        .required()
        .min(6)
        .max(12)
        .trim()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required().options({ abortEarly: false }),

    lastname: Joi.string().min(2).max(30).required(),
    firstname: Joi.string().min(2).max(30).required(),
    isVerified: Joi.boolean(),
}),
    loginSchema: Joi.object().keys({
        email: Joi.string()
        .email({ minDomainSegments: 2, tlds: {allow: ["com", "org", "net"]}})
        .required(),
    password: Joi.string().required(),
}),
      


};


module.exports = {
    validateRequest,
    schemas,
}