import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
export const callFacebookScrapper = async (data) => {
  const scrapperApi = process.env.SF_SCRAPPER;
  try {
    const response = await axios.post(`${scrapperApi}/scrap-facebook`, data);
    console.log('Data successfully sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending post data:', error);
    throw error;
  }
};
