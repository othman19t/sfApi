import Location from '../models/location.model.js';
export const getlocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location } = req.params;
    let decodedLocation = decodeURIComponent(location);
    const result = await Location.findOne({ city: decodedLocation });

    console.log('locationresult: ' + result);
    return res.status(200).send({
      message: 'successfully retrieved Locations',
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'server error occurred',
      success: false,
    });
  }
};
