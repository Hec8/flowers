import { body, param } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('street').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('currency').optional().trim(),
  body('birthDate').optional().isISO8601().withMessage('Date de naissance invalide'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email invalide'),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token requis'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères'),
];

export const addressValidation = [
  body('street').trim().notEmpty().withMessage('Rue requise'),
  body('city').trim().notEmpty().withMessage('Ville requise'),
  body('country').optional().trim(),
  body('zipCode').optional().trim(),
  body('label').optional().trim(),
  body('phone').optional().trim(),
  body('isDefault').optional().isBoolean(),
];

export const idParamValidation = [
  param('id').notEmpty().withMessage('ID requis'),
];
