import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(100, 'Le nom est trop long'),
  email: z.string().email('Format email invalide').max(255),
  classe: z.string().optional(),
  ville: z.string().optional(),
  objectif: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Le message est trop court').max(5000, 'Le message est trop long'),
});

export const validateContact = (req, res, next) => {
  try {
    contactSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez vérifier les informations saisies.',
      errors: error.errors.map(err => ({ path: err.path[0], message: err.message }))
    });
  }
};
