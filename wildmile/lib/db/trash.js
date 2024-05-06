import TrashLog from "../../models/Trash";
import TrashItem from "../../models/TrashItem";
import IndividualTrashItem from "../../models/IndividualTrashItem";
import { getSession } from "lib/getSession";
export async function getAllLogs() {
  return await TrashLog.find({}, ["-_id", "-__v"]);
}

/**
 * We have to use this for pagination because the skip funciton is not a linearly scaling function
 * https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js
 * @param {*} date
 * @returns
 */
export async function getAllLogsBeforeDate(date, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  // return await TrashLog.find({ timeEnd: { $lte: date }, 'deleted': false }, ['-_id', '-__v'])
  return await TrashLog.find({ deleted: false }, ["-_id", "-__v"])
    .skip(skip)
    .limit(limit)
    .sort("-timeEnd");
}

export async function getFilteredLogs(filters) {
  let limit = 100;
  if (filters.limit) {
    limit = filters.limit;
    delete filters["limit"];
  }
  filters.deleted = false;
  const mapped_vals = Object.entries(filters).map(([key, value]) => {
    if (["timeStart", "timeEnd"].includes(key)) {
      return [key, { $lte: new Date(Number(value)) }];
    }
    return [key, value];
  });
  const filter = Object.fromEntries(mapped_vals);
  // If we don't sort it just returns things in any order
  await TrashLog.find(filter, ["-_id", "-__v"])
    .limit(limit)
    .sort("-timeEnd")
    .explain();
  return await TrashLog.find(filter, ["-_id", "-__v"])
    .limit(limit)
    .sort("-timeEnd");
}

export async function getLogByID(id) {
  return await TrashLog.findOne({ _id: id });
}

export async function createLog({
  site,
  participants,
  timeStart,
  timeEnd,
  trashiness,
  temp,
  wind,
  cloud,
  notes,
  weight,
  creator,
  items = {},
}) {
  // const user = await getSession();
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
    weight: weight,
    creator: creator,
  });

  return log;
}

export async function updateLogByID(req, id, update) {
  // Here you update the log based on id in the database
  const log = await findByIdAndUpdate(id, {
    site: update.site,
    numOfParticipants: update.participants,
    timeStart: update.timeStart,
    timeEnd: update.timeEnd,
    trashiness: update.trashiness,
    temp: update.temp,
    wind: update.wind,
    cloud: update.cloud,
    notes: update.notes,
    weight: update.weight,
  });

  log.items = [];

  return log;
}
export async function updateLogItems(items, logId) {
  try {
    if (!items) {
      throw new Error(
        "Request body is missing or does not contain an items property"
      );
    }

    for (const [key, value] of Object.entries(items)) {
      if (value.quantity > 0) {
        const trash_item = await TrashItem.findOne({ _id: value._id });
        const indItem = await IndividualTrashItem.findOneAndUpdate(
          {
            itemId: trash_item._id,
            logId: logId,
          },
          {
            quantity: value.quantity,
          },
          { upsert: true, new: true }
        );
        // log.items.push(indItem)
      }
    }
    // await log.save()
    return items;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
// export async function updateLogItems(items, log) {
//     if (!items) {
//     throw new Error('Request body is missing or does not contain an items property');
//   }

//   Object.entries(items).forEach((item) => {
//     if(item.total > 0){
//       const trash_item = TrashItem.findOne({_id: item._id})
//       const indItem = IndividualTrashItem.findOneAndUpdate({
//         itemId: trash_item._id,
//         logId: log,
//       },
//       {
//         quantity: total
//         },
//       {upsert: true, new: true})
//       log.items.push(indItem)
//     }
//   })
//   await log.save()
// }
