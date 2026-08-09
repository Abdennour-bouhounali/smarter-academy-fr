import { createContact, getContacts } from '../services/contactService.js';

export const handleContactSubmit = async (req, res, next) => {
  try {
    const { name, email, message, classe, ville, objectif, phone } = req.body;
    
    await createContact({ name, email, message, classe, ville, objectif, phone });
    
    return res.status(201).json({
      success: true,
      message: 'Votre message a bien été envoyé.'
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetContacts = async (req, res, next) => {
  try {
    const contacts = await getContacts();
    return res.status(200).json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
};
