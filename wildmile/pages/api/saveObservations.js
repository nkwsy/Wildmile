import dbConnect from 'lib/db/setup';
import Observation from 'models/cameratrap/Observation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const observations = req.body;
    const savedObservations = await Observation.insertMany(observations);
    res.status(201).json({ message: 'Observations saved successfully', count: savedObservations.length });
  } catch (error) {
    console.error('Error saving observations:', error);
    res.status(500).json({ message: 'Error saving observations' });
  }
}
