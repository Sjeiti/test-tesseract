import {intersect} from './array'

// interface IMimes {
//   [key: string]: {
//     [key: string]: [
//       string, // extensions
//       string? // headerParts
//     ]
//   }
// }
//
// interface IMimeFlat {
//    [key: string]: string[]
// }

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const mimes/*:IMimes*/ = {
  application: {
    msword: ['doc', 'd0cf11e0 a1b11ae1 dba52d00 eca5c100'],
    rtf: ['rtf', '7b5c7274'],
    pdf: ['pdf', '25504446'],
    'vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx', '504b0304 504b34 504b030414000600 14000600'],
    'vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx', '504b34'],
    'vnd.ms-powerpoint': ['pot pps ppt'],
    'vnd.ms-excel': ['xls', '504b34'], // is a zipped format
    'x-tar': ['tar', '68656c70'],
    'x-zip-compressed': ['zip', '504b34'],
    zip: ['zip', '504b34'],
    gzip: ['gzip', '1f8b88'],
    'x-7z-compressed': ['7z', '377abcaf'],
    postscript: ['eps ai ps', '25215053'] // ai===pdf?
  },
  text: {
    plain: ['txt'],
    csv: ['csv']
  },
  image: {
    gif: ['gif', '47494638'],
    jpeg: ['jpe jpeg jpg', 'ffd8ffe0 ffd8ffe1 ffd8ffe2 ffd8ffe3 ffd8ffe8'],
    png: ['png', '89504e47 25215053'],
    'svg+xml': ['svg', '3c737667']
  }
}

const mimeExtensions/*:IMimeFlat*/ = Object.entries(mimes).reduce((acc, [namespace, types])=>{
  Object.entries(types).forEach(([type, [extensions]])=>{
    acc[`${namespace}/${type}`] = extensions.split(' ')
  })
  return acc
}, {})

const mimeHeaders/*:IMimeFlat*/ = Object.entries(mimes).reduce((acc, [namespace, types])=>{
  Object.entries(types).forEach(([type, [, headers]])=>{
    headers?.length&&(acc[`${namespace}/${type}`] = headers?.split(' ')||[])
  })
  return acc
}, {})

/**
 * Turn the input[type=file][accept] attribute into a list of mime types
 * @param {string} accept
 * @returns {string[]}
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 */
export function acceptToMimes(accept/*:string*/)/*:string[]*/ {
  const split = accept.split(/,/g).map(s=>s.replace(/^\s?\.|\s$/g, ''))
  const wildcards = split.filter(s=>/\w+\/\*/.test(s)).map(s=>s.replace(/\/\*$$/, ''))
  const exact = split.filter(s=>/\w+\/[^*]/.test(s))
  return Object.entries(mimeExtensions).filter(([mimeType, extensions])=>{
    const intersection = intersect(extensions, split)
    const isExtension = intersection.length>0
    const isExact = exact.includes(mimeType)
    const mimeBase = mimeType.replace(/\/\*$$/, '')
    const isWildcard = wildcards.filter(wildcard=>mimeBase.includes(wildcard)).length>0
    return isExtension||isExact||isWildcard
  }).map(([mimeType])=>mimeType)
}

/**
 * Turn list of mimes into a list of extensions
 * @param {string[]} mimes
 * @returns {string[]}
 */
export function mimesToExtensions(mimes/*:string[]*/)/*:string[]*/ {
  const replacedMimes = mimes.map(mime=>mime.replace(/\/\*$/, ''))
  return Object.entries(mimeExtensions)
      .filter(([key])=>replacedMimes.includes(key)||mimes.map(mime=>new RegExp(mime.replace('/', '\\/').replace('*', '\\w+')).test(key)).includes(true))
      .reduce((acc, [, value])=>(acc.push(...value), acc), [])
}

/**
 * Test if a file blob is of an accepted mime type by checking the file header
 * @param {File} blob
 * @param {string[]} validMimes
 * @returns {boolean}
 */
export async function isValidMime(blob/*:File*/, validMimes/*:string[]*/)/*:Promise<boolean>*/ {
  const header = await getHeaderSignature(blob)
  const mime = getMimeFromHeader(header)
  const wildcards = validMimes.filter(mime=>mime.includes('*'))
  const validMimesExtended = [...validMimes, ...(wildcards.length&&acceptToMimes(wildcards.join(','))||[])]
  return validMimesExtended.includes(mime)||validMimes.length===0
}

/**
 * Test if a file is of an accepted extension
 * @param {File} file
 * @param {string[]} validExtensions
 * @returns {boolean}
 */
export function isValidExtension(file/*:File*/, validExtensions/*:string[]*/)/*:boolean*/ {
  const extension = fileExtension(file)?.toLowerCase()||null
  return validExtensions.includes(extension)||validExtensions.length===0
}

/**
 * Get the extension from a file
 * @param {File} file
 * @returns {string}
 */
export function fileExtension(file/*:File*/)/*:string*/ {
  return file.name.match(/\.([^.]+)$/)?.pop()||null
}

/**
 * Get the signature from a blobs header
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function getHeaderSignature(blob/*:Blob*/)/*:Promise<string>*/ {
  return new Promise(resolve=>{
    const fileReader = new FileReader()
    fileReader.addEventListener('loadend', (e/*:ProgressEvent*/)=>{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const target = e.target /*as any*/ // TypeScript implementation for FileReader lacks result property
      const fileHeaderBytes = new Uint8Array(target.result).subarray(0, 4)
      resolve(Array.from(fileHeaderBytes).map(n=>n.toString(16)).join(''))
    })
    fileReader.readAsArrayBuffer(blob)
  })
}

/**
 * Get the mime type from a header
 * @param {string} header
 * @returns {string}
 */
function getMimeFromHeader(header/*:string*/)/*:string*/ {
  return Object.entries(mimeHeaders)
      .filter(([, headers])=>headers.includes(header))
      .map(([mime])=>mime).pop()
}
