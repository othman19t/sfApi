import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

const jwtAuthentication = (req, res, next) => {
  // console.log('JWT authentication hit');
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401); // No token found in the Authorization header
  }

  const token = authHeader.split(' ')[1]; // Extract the token part from the header
  // console.log('Token from header: ', token);

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Invalid token
    }
    req.user = user;
    next(); // Token is valid, proceed to the next middleware/route handler
  });
};

export default jwtAuthentication;
