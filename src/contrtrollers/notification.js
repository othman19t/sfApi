import Notification from '../models/notification.model.js';
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId, status: 'unread' });
    //TODO: change status of notifications to read
    console.log('notifications: ' + notifications);
    return res.status(200).send({
      message: 'successfully retrieved notifications',
      success: true,
      notifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
