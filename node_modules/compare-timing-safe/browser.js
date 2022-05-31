/**
 * string, buffer comparison in length-constant time
 * @see https://codahale.com/a-lesson-in-timing-attacks/
 *
 * @param {string|Uint8Array} a - string or buffer from input
 * @param {string|Uint8Array} b - string or buffer to compare with `a`
 * @return {boolean} true if strings match
 */
function timingSafeEqual (a, b) {
  const _a = toArray(a)
  const _b = toArray(b)
  let diff = bton(_a.length !== _b.length)
  for (let i = 0; i < _b.length; i++) {
    diff |= bton(_a[i] !== _b[i])
  }
  return (diff === 0)
}

export default timingSafeEqual

const bton = (/** @type {boolean} */b) => b ? 1 : 0

function toArray (strOrArr) {
  return strOrArr?.length ? strOrArr : strOrArr.split('')
}
