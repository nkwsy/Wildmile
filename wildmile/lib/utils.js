export function cleanObject(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) {
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function sortAlphabetically(object, key, direction = "asc") {
  return object.sort((a, b) => {
    const nameA = a[key].toUpperCase(); // ignore upper and lowercase
    const nameB = b[key].toUpperCase(); // ignore upper and lowercase
    if (direction === "asc") {
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
    } else {
      if (nameA < nameB) {
        return 1;
      }
      if (nameA > nameB) {
        return -1;
      }
    }
    // names must be equal
    return 0;
  });
}

export function onChangeDate(date) {
  console.log(date.toISOString());
  this.setState({ startDate: date });
}
// const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
//   if (value === "" || value === undefined) {
//     // Do not include empty strings or undefined values
//   } else {
//     acc[key] = value;
//   }
//   return acc;
// }, {});
