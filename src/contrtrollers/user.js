import User from '../models/user.model.js';
export const getUserByToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    console.log('getUserByToken is called');
    console.log('User: ' + user);
    res.status(200).send({
      message: 'successfully got user info',
      success: true,
      user: {
        loggedIn: true,
        id: user.id.toString(),
        name: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        credit: user?.credit,
      },
    });
  } catch (error) {}
};
