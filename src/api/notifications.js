import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

export const handleCreateNotification = async (notifications) => {
  console.log('notifications.length: ', notifications.length);

  const api = process.env.SF_API;
  const response = await axios.post(
    `${api}/api/notification/create-notifications`,
    {
      notifications,
    }
  );
  console.log('Data successfully sent:', response.data);
  return response.data;
};
