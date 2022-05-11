import tesseract from 'tesseract.js'
const { createWorker } = tesseract
console.log('tesseract',tesseract) // todo: remove log

const pre = document.querySelector('pre')

const input = document.querySelector('input[type=file]')
input.addEventListener('change', onInputFileChange)

const reader = new FileReader()
reader.addEventListener('load', onReaderLoad.bind(null, document.querySelector('img')))

function onInputFileChange(e){
	console.log('onInputFileChange',e) // todo: remove log
	const {target} = e
  const [file] = target?.files

  pre.textContent = ''

  reader.readAsDataURL(file)

  doOCR(file).then(whenRecognized)

  const {size=0} = file
  console.log('size',size) // todo: remove log
}

function onReaderLoad(img, e){
  img.src = e.target.result;
}

async function doOCR(image){
    const worker = createWorker()
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const result = await worker.recognize(image)
    console.log('withWorker',result) // todo: remove log
  return result
}

function whenRecognized(result) {
  const { data: { text } } = result
  pre.textContent = text
}
