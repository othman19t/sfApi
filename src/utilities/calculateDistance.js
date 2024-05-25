import googleMaps from '@google/maps';

const calculateDistance = async (address1, address2, radius) => {
  // console.log(
  //   'calculateDistance logs of data passed:',
  //   address1,
  //   address2,
  //   radius
  // );
  return new Promise((resolve, reject) => {
    const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

    const googleMapsClient = googleMaps.createClient({
      key: GOOGLE_MAP_API_KEY,
      Promise: Promise,
    });

    googleMapsClient
      .distanceMatrix({
        origins: [address1],
        destinations: [address2],
        mode: 'driving',
        units: 'metric',
      })
      .asPromise()
      .then((response) => {
        const distance = response.json.rows[0].elements[0].distance;
        const d = distance?.text.replace(' km', '');

        const result = { km: d, close: parseInt(radius) >= parseInt(d) };

        // console.log('calculateDistance logs of result:', result);

        resolve(result.close); // Resolve the promise with the result
      })
      .catch((err) => {
        console.error('Error:', err);
        reject({ success: false, message: err });
      });
  });
};

export default calculateDistance;
