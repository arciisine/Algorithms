export function randomNumbers(size:number, min = 0, max = 1000) {
  let out = [];
  for (let i = 0; i < size; i++) {
    out.push(parseInt(`${Math.random() * (max-min)}`) + min)
  }
  return out;
}