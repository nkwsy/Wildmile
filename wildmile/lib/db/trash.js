import { TrashLog } from '../../models/Trash'

export async function getAllLogs() {
  return await TrashLog.find({}, ['-_id', '-__v'])
}

/**
 * We have to use this for pagination because the skip funciton is not a linearly scaling function
 * https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js
 * @param {*} date 
 * @returns 
 */
export async function getAllLogsBeforeDate(date, limit = 10) {

  return await TrashLog.find({ timeEnd: { $lte: date }, 'deleted': false }, ['-_id', '-__v'])
    .limit(limit)
    .sort('-timeEnd')
}

export async function getFilteredLogs(filters) {
  let limit = 10
  if (filters.limit) {
    limit = filters.limit
    delete filters['limit']
  }
  const filter = Object.entries(filters).map(([key, value]) => {
    if(['timeStart', 'timeEnd'].includes(key)){
      return { [key]: { $lte: [value] }}
    }
    return { [key]: value }
  })
  return await TrashLog.find(filter, ['-_id', '-__v'])
    .limit(limit)
}

export async function getLogByID(id) {
  return await TrashLog.findOne({ _id: id })
}

export async function createLog({ scientific_name, common_name, notes, image_url, synonyms = [] }) {

  // Here you should insert the Log into the database
  const log = await TrashLog.create({
    scientific_name: scientific_name,
    common_name: common_name,
    notes: notes,
    image_url: image_url,
    synonyms: synonyms,
  })
  return log
}

export async function updateLogByID(req, id, update) {
  // Here you update the log based on id in the database
  const log = await getLogByID(id)

  return log
}

