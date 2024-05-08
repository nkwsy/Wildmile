export function cleanObject(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) {
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}
// const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
//   if (value === "" || value === undefined) {
//     // Do not include empty strings or undefined values
//   } else {
//     acc[key] = value;
//   }
//   return acc;
// }, {});
