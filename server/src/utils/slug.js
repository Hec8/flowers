import slugify from 'slugify';

export const createSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'fr' });

export const parseDecimal = (value) => parseFloat(value?.toString() || '0');
