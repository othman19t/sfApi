export const getUserByToken = async (req, res) => {
  const user = req.user;
  console.log('User: ' + user);
  res.status(200).send({
    message: 'successfully got user info',
    success: true,
    user: {
      loggedIn: true,
      id: user.id,
    },
  });
};
