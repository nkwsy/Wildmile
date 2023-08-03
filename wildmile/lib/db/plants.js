import Plant from '../../models/Plant'

export async function getAllPlants() {
  return await Plant.find({}, ['-_id'])
}
