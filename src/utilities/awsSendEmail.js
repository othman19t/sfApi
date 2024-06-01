import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import createEmailTemplate from './emailTemplate.js'; // Ensure you provide the correct path
import dotenv from 'dotenv';
dotenv.config();

const accessKeyId = process.env.AWS_EMAIL_ACCESS_KEY;
const secretAccessKey = process.env.AWS_EMAIL_SECRET_ACCESS_KEY;
// Configure AWS SDK
const client = new SESClient({
  region: 'us-west-1', // Replace with your SES region
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Ensure the credentials are set correctly and log the region and credentials
(async () => {
  try {
    const creds = await client.config.credentials();
    console.log('AWS Region:', client.config.region);
    console.log('Access Key ID:', creds.accessKeyId);
  } catch (error) {
    console.error('Error getting configuration:', error);
  }
})();

// Email content
export const sendEmail = async ({
  toAddress,
  imgSrc,
  title,
  price,
  location,
  postUrl,
}) => {
  const htmlBody = createEmailTemplate({
    imgSrc,
    title,
    price,
    location,
    postUrl,
  });

  const params = {
    Destination: {
      ToAddresses: [toAddress], // Replace with the recipient's email
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: htmlBody,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `smoothFlip ${title}`,
      },
    },
    Source: 'othman19t@gmail.com', // Replace with your verified email
  };

  try {
    const data = await client.send(new SendEmailCommand(params));
    console.log('Email sent successfully:', data.MessageId);
  } catch (err) {
    console.log('Error sending email:', err);
  }
};
