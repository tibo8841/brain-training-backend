'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

/**
 * string, buffer comparison in length-constant time
 * uses crypto module
 * @see https://codahale.com/a-lesson-in-timing-attacks/
 *
 * @param {String|Buffer} a - string or buffer from input
 * @param {String|Buffer} b - string or buffer to compare with `a`
 * @return {Boolean} true if strings match
 * @example
 * const timingSafeEqual = require('compare-timing-safe')
 * const input = 'a'
 * const compareWith = 'bbbbbbbb'
 * timingSafeEqual(input, compareWith)
 * //> false
 */
function timingSafeEqual (a, b) {
  const key = crypto__default["default"].randomBytes(32);
  const toHmac = (str) => crypto__default["default"].createHmac('sha256', key).update(str).digest();
  return crypto__default["default"].timingSafeEqual(toHmac(a), toHmac(b))
}

exports["default"] = timingSafeEqual;
module.exports = exports["default"];
