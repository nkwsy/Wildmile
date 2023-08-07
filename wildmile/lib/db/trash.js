import {TrashLog} from '../../models/Trash'

export async function getAllLogs() {
  return await TrashLog.find({}, ['-_id'])
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

