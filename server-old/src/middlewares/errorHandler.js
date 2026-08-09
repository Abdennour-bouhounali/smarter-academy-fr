export const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err.message);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Une erreur interne est survenue.',
    ...(isProduction ? {} : { stack: err.stack })
  });
};
