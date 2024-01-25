import TrashLog from '../../models/Trash'
import IndividualTrashItem from '../../models/IndividualTrashItem'
import TrashItem from '../../models/TrashItem'

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
  let limit = 100
  if (filters.limit) {
    limit = filters.limit
    delete filters['limit']
  }
  filters.deleted = false
  const mapped_vals = Object.entries(filters).map(([key, value]) => {
    if (['timeStart', 'timeEnd'].includes(key)) {
      return [key, { $lte: new Date(Number(value)) }]
    }
    return [key, value]
  })
  const filter = Object.fromEntries(mapped_vals)
  // If we don't sort it just returns things in any order
  await TrashLog.find(filter, ['-_id', '-__v']).limit(limit).sort('-timeEnd').explain()
  return await TrashLog.find(filter, ['-_id', '-__v']).limit(limit).sort('-timeEnd')
}

export async function getLogByID(id) {
  return await TrashLog.findOne({ _id: id })
}

export async function createLog({ site, participants, timeStart, timeEnd, trashiness, temp, wind, cloud, notes, items = {} }) {

  // Here you should insert the Log into the database
  let log = await TrashLog.create({
    site: site,
    numOfParticipants: participants,
    timeStart: timeStart,
    timeEnd: timeEnd,
    trashiness: trashiness,
    temp: temp,
    wind: wind,
    cloud: cloud,
    notes: notes,
  })

  log.items = []

  Object.entries(items).forEach(([item, total]) => {
    if(total > 0){
      const trash_item = TrashItem.findOne({name: item})
      const indItem = IndividualTrashItem.create({
        itemId: trash_item._id,
        logId: log._id,
        quantity: total,
      })
      log.items.push(indItem)
    }
  })

  return log
}

export async function updateLogByID(req, id, update) {
  // Here you update the log based on id in the database
  const log = await findByIdAndUpdate(id,
    {
      site: update.site,
      numOfParticipants: update.participants,
      timeStart: update.timeStart,
      timeEnd: update.timeEnd,
      trashiness: update.trashiness,
      temp: update.temp,
      wind: update.wind,
      cloud: update.cloud,
      notes: update.notes,
    }
    )

  log.items = []

  Object.entries(update.items).forEach(([item, total]) => {
    if(total > 0){
      const trash_item = TrashItem.findOne({name: item})
      const indItem = IndividualTrashItem.findOneAndUpdate({
        itemId: trash_item._id,
        logId: id,
      }, {quantity: total})
      log.items.push(indItem)
    }
  })

  return log
}

