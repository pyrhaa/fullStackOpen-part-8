// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const unknownEndpoint = (req, res) => {
//   res.status(404).send({ error: 'unknown endpoint' });
// };

// const errorHandler = (error, req, res) => {
//   if (error.name === 'CastError' && error.kind === 'ObjectId') {
//     return res.status(400).send({ error: 'malformatted id' });
//   } else if (error.name === 'ValidationError') {
//     return res.status(400).json({ error: error.message });
//   } else if (error.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       error: 'invalid token'
//     });
//   } else if (error.name === 'TokenExpiredError') {
//     return res.status(401).json({ error: 'token expired' });
//   }
// };

// const tokenExtractor = (req, res, next) => {
//   const authorization = req.get('authorization');
//   if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
//     req.token = authorization.substring(7);
//     return next();
//   }
//   req.token = null;
//   return next();
// };

// const userExtractor = async (req, res, next) => {
//   if (req.token) {
//     const decodedToken = jwt.verify(req.token, process.env.SECRET);
//     if (decodedToken.id) {
//       req.user = await User.findById(decodedToken.id);
//     } else {
//       req.user = null;
//     }
//   } else {
//     req.user = null;
//   }
//   next();
// };

// module.exports = {
//   unknownEndpoint,
//   errorHandler,
//   tokenExtractor,
//   userExtractor
// };
