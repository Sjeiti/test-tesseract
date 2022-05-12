/**
 * Methods that return arrays or have a signature with only arrays.
 * @module
 */

/**
* Compare arrays and warn.msg when a1 is not contained within a2
* @param {Array} a1
* @param {Array} a2
* @param {string} msg
* @param {Console} cons
* @returns {boolean}
*/
export function compareArrays(a1/*:any[]*/, a2/*:any[]*/, msg/*?:string*/, cons/*?:Console*/)/*:boolean*/ { // eslint-disable-line @typescript-eslint/no-explicit-any
  const missing = a1.filter(s => !a2.includes(s))
  missing.length&&msg&&(cons||console).warn(`${msg}: ${missing.join(', ')}`)
  return missing.length===0
}

/**
 * Compares the content of two arrays for equality
 * @param {Array} a1
 * @param {Array} a2
 * @returns {boolean}
 * @see https://gitlab.rgnservices.com/online-spa-widgets/spa-widgets-candidates/-/blob/master/apps/job-application/src/app/components/job-application-form/utils.ts
 */
export function areArraysEqual(a1/*:any[]*/, a2/*:any[]*/)/*:boolean*/ { // eslint-disable-line @typescript-eslint/no-explicit-any
  return compareArrays(a1, a2)&&compareArrays(a2, a1)
}

/**
 * Add up all numbers in a list and set toFixed to address rounding errors in the decimal part, but discard any 0 suffixes.
 * The issue being `1.2 + 2.4 = 3.5999999999999996` in JavaScript
 * @param {number[]} list
 * @param {number} [fractionDigits=2]
 * @returns {string}
 */
export function sumToFixed(list/*:number[]*/, fractionDigits/*:number*/=2)/*:string*/ {
  const isAllNan = list.every(isNaN)
  const sum = list.reduce((acc, number)=>acc+number, 0)
  return isAllNan||isNaN(sum)?'':sum.toFixed(fractionDigits).replace(/0*$|\.0*$/, '')
}

/**
 * Find the intersection of two arrays
 * @param {Array} array1
 * @param {Array} array2
 * @returns {Array}
 */
export function intersect(array1, array2) {
  return array1.filter(value => array2.includes(value))
}

/**
 * Removes a certain item from an array
 * @see https://stackoverflow.com/a/5767357/5449101
 * @param {any[]} array
 * @param {any} item
 * @returns {boolean} Whether item was found
 */
export function removeFromArray(array/*:any[]*/, item/*:any*/)/*:boolean*/ { // eslint-disable-line @typescript-eslint/no-explicit-any
  const index = array.indexOf(item)
  const hasItem = index>=0
  hasItem&&array.splice(index, 1)
  return hasItem
}

/**
 * Push an item to an array and return it
 * @param {Array} array
 * @param {any} item
 * @returns {any} item
 * @todo should we spread push?
 */
export function pushReturn(array/*:any[]*/, item/*:any*/) { // eslint-disable-line @typescript-eslint/no-explicit-any
  array.push(item)
  return item
}
