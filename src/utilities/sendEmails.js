import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();
//EMAIL_API_KEY

const apiKey = process.env.EMAIL_API_KEY;
export const sendNotificationEmail = ({
  to,
  img_src,
  title,
  location,
  description,
  post_url,
  price,
  distance,
}) => {
  // Set your SendGrid API key here
  sgMail.setApiKey(`${apiKey}`);

  const msg = {
    to,
    from: 'othman19t@gmail.com', // Change to your verified sender
    templateId: 'd-5d23d7fb6db644edb0cb1e82626be29c', // Change to your SendGrid template ID
    dynamicTemplateData: {
      // These fields depend on the variables you've used in your SendGrid template
      img_src,
      title,
      location,
      description,
      post_url,
      price,
      distance,

      // Additional dynamic data fields can be added as needed
    },
  };
  (async () => {
    try {
      await sgMail.send(msg);
      console.log('Email sent');
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  })();
};
