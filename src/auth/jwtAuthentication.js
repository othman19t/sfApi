import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

const jwtAuthentication = (req, res, next) => {
  console.log('jwt authentication hit');
  // Extract the token from cookies
  const token = req.cookies.auth_token; // Assuming you've set the token under the cookie name 'token'
  console.log('req.cookies: ', req.cookies);
  console.log('token: ', token);
  if (!token) return res.sendStatus(401); // No token found

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next(); // Token is valid, proceed to the next middleware/route handler
  });
};

export default jwtAuthentication;
