let mockData = {
  '1': 'one',
  '2': 'two',
  '3': 'three',
}
export function fetchItem(id) {
  return new Promise((resolve, reject) => {
    if (mockData[id]) {
      resolve(mockData[id]);
    } else {
      reject('no such id');
    }
  })
}