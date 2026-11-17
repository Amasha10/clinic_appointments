module.exports = function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  if (error.name === 'MulterError') {
    return response.status(400).json({ message: error.message });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: error.message });
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ message: 'The supplied ID is invalid.' });
  }
  if (error.code === 11000) {
    return response.status(409).json({ message: 'That value is already in use.' });
  }

  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return response.status(status).json({
    message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
  });
};