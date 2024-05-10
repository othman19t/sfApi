import Notification from '../models/notification.model.js';
export const getUserNotifications = async (userId) => {
  try {
    // Fetch unread notifications for the user.
    const notifications = await Notification.find({ userId, status: 'unread' });

    // Collect data to return.
    const data = notifications.map((notification) => notification?.postId);

    // If there are any notifications to update, change their status to 'read'.
    if (notifications.length > 0) {
      await Notification.updateMany(
        { userId, status: 'unread' },
        { $set: { status: 'read' } }
      );
    }

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const createNotification = async (req, res) => {
  const { notifications } = req.body;
  try {
    const insertNotifications = await Notification.insertMany(notifications);
    console.log('insertNotifications', insertNotifications);
    return res.status(200).send({
      message: 'successfully created notifications',
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
