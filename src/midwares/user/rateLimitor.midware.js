import  rateLimit  from "express-rate-limit";

export const rateLimitor = rateLimit({
    windowMs: 10 * 60 * 1000,  // reattampt after 10 mint
     max: 5,
     message: 'Too many attampt please retry again after 10 minutes',
     standardHeaders: true,
     legacyHeaders: false,
});
