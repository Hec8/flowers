import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sanitizeUser,
} from '../utils/jwt.js';
import { generateResetToken } from '../utils/helpers.js';
import { sendEmail } from '../config/mailer.js';
import { passwordResetEmail } from '../templates/emailTemplates.js';

const SALT_ROUNDS = 12;

export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    currency = 'FCFA',
    birthDate,
    marketingOptIn = false,
    street,
    city,
    country = 'Bénin',
    zipCode,
  } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Cet email est déjà utilisé', 409);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      currency,
      birthDate: birthDate ? new Date(birthDate) : null,
      marketingOptIn,
      addresses: street && city
        ? {
            create: {
              street,
              city,
              country,
              zipCode,
              isDefault: true,
            },
          }
        : undefined,
    },
    include: { addresses: true },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Email ou mot de passe incorrect', 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token requis', 400);

  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.refreshToken !== refreshToken || !user.isActive) {
    throw new AppError('Refresh token invalide', 401);
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefreshToken },
  });
};

export const logout = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken: null },
  });

  res.json({ success: true, message: 'Déconnexion réussie' });
};

export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { addresses: true },
  });

  res.json({ success: true, data: sanitizeUser(user) });
};

export const updateProfile = async (req, res) => {
  const { name, currency, birthDate, marketingOptIn } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(currency && { currency }),
      ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      ...(marketingOptIn !== undefined && { marketingOptIn }),
    },
    include: { addresses: true },
  });

  res.json({
    success: true,
    message: 'Profil mis à jour',
    data: sanitizeUser(user),
  });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError('Mot de passe actuel incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  res.json({ success: true, message: 'Mot de passe modifié' });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Réponse identique que l'email existe ou non (sécurité)
  if (user) {
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1h

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reinitialiser-mot-de-passe?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe — NFlowers',
      html: passwordResetEmail({ name: user.name, resetUrl }),
    });
  }

  res.json({
    success: true,
    message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new AppError('Lien de réinitialisation invalide ou expiré', 400);
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
  ]);

  res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
};

// --- Addresses ---

export const getAddresses = async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { isDefault: 'desc' },
  });
  res.json({ success: true, data: addresses });
};

export const createAddress = async (req, res) => {
  const { street, city, country, zipCode, label, phone, isDefault } = req.body;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user.id,
      street,
      city,
      country: country || 'Bénin',
      zipCode,
      label,
      phone,
      isDefault: isDefault === true || isDefault === 'true',
    },
  });

  res.status(201).json({ success: true, data: address });
};

export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { street, city, country, zipCode, label, phone, isDefault } = req.body;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) throw new AppError('Adresse introuvable', 404);

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      street,
      city,
      country,
      zipCode,
      label,
      phone,
      isDefault: isDefault === true || isDefault === 'true',
    },
  });

  res.json({ success: true, data: address });
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) throw new AppError('Adresse introuvable', 404);

  await prisma.address.delete({ where: { id } });
  res.json({ success: true, message: 'Adresse supprimée' });
};
