import dbConnect from 'lib/db/setup';
import CameratrapMedia from 'models/cameratrap/Media';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const randomImage = await CameratrapMedia.aggregate([{ $sample: { size: 1 } }]);
    if (randomImage.length > 0) {
      res.status(200).json(randomImage[0]);
    } else {
      res.status(404).json({ message: 'No images found' });
    }
  } catch (error) {
    console.error('Error fetching random image:', error);
    res.status(500).json({ message: 'Error fetching random image' });
  }
}
