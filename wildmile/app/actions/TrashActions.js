"use server";
import TrashItem from "models/TrashItem";
import IndividualTrashItem from "models/IndividualTrashItem";
import TrashLog from "models/Trash";
export async function updateTrashCount(itemId, logId, quantity) {
  const item = await IndividualTrashItem.findOneAndUpdate(
    { itemId: itemId, logId: logId }, // find a document with these properties
    { quantity: quantity }, // update the count property
    {
      new: true, // return the updated document
      upsert: true, // create a new document if no match is found
    }
  );
  console.log("Updated item: ", item);
  return item.count;
}

export async function getTrashCount(itemId, logId) {
  const item = await IndividualTrashItem.findOne(
    { itemId: itemId, logId: logId }, // find a document with these properties
    { quantity: 1 } // return only the count property
  );
  console.log("Updated item: ", item);
  return item ? item.quantity : 0;
}

export async function getItemsFromLog(useLogId) {
  //   await dbConnect();
  const id = useLogId; // Get the id from the request parameters
  console.log("id" + id);
  // const result = await TrashItem.find({}, [
  //   // "-creator",
  //   "-__v",
  //   "-createdAt",
  //   "-updatedAt",
  // ])
  // .populate({
  //   path: "individualTrashItem",
  //   match: { logId: id },
  //   model: "IndividualTrashItem",
  //   select: "-__v -createdAt -updatedAt -deleted -creator",
  // })
  // .lean();
  // const result = await TrashItem.find({}, ).lean();
  /* find all the data in our database */
  try {
    const trashLogInfo = await TrashLog.findById(id, { maxTimeMS: 5000 })
      .populate({
        path: "items",
        model: "IndividualTrashItem",
        select: "-__v -createdAt -updatedAt -deleted -creator",
      })
      .lean()
      .explain();
    console.log("TrashLogInfo:", trashLogInfo);

    const trashLog = await TrashLog.findById(id)
      .populate({
        path: "items",
        model: "IndividualTrashItem",
        select: "-__v -createdAt -updatedAt -deleted -creator",
      })
      .lean();

    const trashLogItems = trashLog.items.reduce((acc, doc) => {
      const item = { ...doc };
      item._id = item._id.toString();
      item.itemId = item.itemId.toString();
      item.logId = item.logId.toString();
      item.quantity = item.quantity;
      acc[item.itemId] = item;
      return acc;
    }, {});

    const result = await TrashItem.find({ deleted: false }, [
      // "-_id",
      "-creator",
      "-__v",
      "-createdAt",
      "-updatedAt",
      // "-deleted",
    ]).lean();
    const items = result.reduce((acc, doc) => {
      const item = { ...doc }; // Clone the document to avoid mutating the original result
      item._id = item._id.toString();
      item.quantity = 0;
      item.values = {};
      acc[item._id] = item;
      return acc;
    }, {});
    for (const itemId of Object.keys(trashLogItems)) {
      const updatedItem = items[itemId];
      if (updatedItem) {
        updatedItem.quantity = trashLogItems[itemId].quantity;
        updatedItem.values = trashLogItems[itemId];
      }
    }
    // const items = result;

    console.log("TrashLog:", trashLog, items);
    return { items: items, logId: id };
  } catch (error) {
    console.error("Error looking for trash items from log:", error);
  }

  // return { props: { items: items } };
  // }
  // .lean();
  // console.log("Result:", result);
  // const items = result.reduce((acc, doc) => {
  //   const item = { ...doc }; // Clone the document to avoid mutating the original result
  //   item._id = item._id.toString();

  //   // Initialize quantity for each item
  //   item.quantity = 0;
  //   // If an IndividualTrashItem was found, accumulate its quantity
  //   // if (item.individualTrashItem) {
  //   //   // Ensure correct data types and aggregate quantity
  //   //   item.quantity += item.individualTrashItem.quantity; // Accumulate quantities
  //   // }
  //   // // Remove the individualTrashItem property to clean up the final output
  //   // delete item.individualTrashItem;

  //   // Use the _id of the item as the key in the accumulated results
  //   acc[item._id] = item;
  //   return acc;
  // }, {});

  // return { items: items, logId: id };
}
