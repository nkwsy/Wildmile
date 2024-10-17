import dbConnect from 'lib/db/setup';
import Observation from 'models/cameratrap/Observation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const observation = new Observation(req.body);
    await observation.save();
    res.status(201).json({ message: 'Observation saved successfully' });
  } catch (error) {
    console.error('Error saving observation:', error);
    res.status(500).json({ message: 'Error saving observation' });
  }
}
