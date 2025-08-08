// src/middleware/monitorResponses.js
const SystemLogger = require('../models/logger/systemModel');

const monitorResponses = (req, res, next) => {
  const originalSend = res.send;

  res.send = async function (body) {
    
    // Evita duplicar erro 500, pois já vai pelo errorHandler
    if (res.statusCode !== 200 && res.statusCode < 500) {
      await SystemLogger.logBadResponse(req, res);
    } else if (res.statusCode >= 500) {
      await SystemLogger.logError({
        message: `Resposta com status ${res.statusCode}`,
        route: req.originalUrl,
        method: req.method,
        stack: body, 
        userId: req.user ? req.user.id : null // Passa o erro inteiro para pegar sqlMessage etc
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

module.exports = monitorResponses;
