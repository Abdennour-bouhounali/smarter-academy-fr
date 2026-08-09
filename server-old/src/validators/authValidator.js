import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email invalide').max(255),
  password: z.string().min(1, 'Le mot de passe est requis').max(255),
});

export const validateLogin = (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Email ou mot de passe incorrect.',
    });
  }
};
