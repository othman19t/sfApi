import { addBlockedIp } from '../utilities/proxies.js';
export const blockProxy = async (req, res) => {
  const { ip, proxiesName } = req?.body;
  console.log('body', req?.body);
  try {
    addBlockedIp({ ip: `${ip}` }, proxiesName);

    return res.status(200).send({
      message: 'successfully blocked proxy user',
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
