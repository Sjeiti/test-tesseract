import tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import {isValidMime} from './utils/file'

(async function(){

  pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.js'

  const { createWorker, createScheduler } = tesseract
  console.log('tesseract',tesseract) // todo: remove log

  const scheduler = createScheduler()
  // const workers = Array.from(3).fill(0).map(async ()=>{
  //   const worker = createWorker()
  //   await worker.load()
  //   await worker.loadLanguage('eng')
  //   await worker.initialize('eng')
  //   scheduler.addWorker(worker)
  //   return worker
  // })
  const workers = Array.from(new Array(1)).map(createWorker)
  await workers.forEach(async worker=>{
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
  })
  workers.forEach(scheduler.addWorker)
  console.log('workers',workers) // todo: remove log

  const pre = document.querySelector('pre')
  const img = document.querySelector('img')
  const time = document.querySelector('time')

  const input = document.querySelector('input[type=file]')
  input.addEventListener('change', onInputFileChange)

  const reader = new FileReader()
  reader.addEventListener('load', onReaderLoad)

  async function onInputFileChange(e){
    console.log('onInputFileChange',e) // todo: remove log

    const startTime = Date.now()

    pre.textContent = ''
    img.src = ''
    time.textContent = ''

    const {target} = e
    const [file] = target?.files

    // const {size=0} = file
    // console.log('size',size) // todo: remove log

    const isPDF = await isValidMime(file, ['application/pdf'])
    const isImage = await isValidMime(file, ['image/*'])

    if (isImage) {
      await showAndReadImage(file)
      logStamp(startTime)
    }

    if (isPDF) {

      const pdfDocument = await pdfjsLib.getDocument({data: new Uint8Array(await file.arrayBuffer())}).promise
      const page = await pdfDocument.getPage(1)

      const scale = 1.5
      const viewport = page.getViewport({scale})

      const canvas = document.createElement('canvas') // up scope
      canvas.height = viewport.height
      canvas.width = viewport.width
      const canvasContext = canvas.getContext('2d')

      const renderContext = { canvasContext, viewport}
      await page.render(renderContext).promise

      canvas.toBlob(async blob=>{
        blob.name = `a${Date.now()}` // name undefined error
        await showAndReadImage(blob)
        logStamp(startTime)
      })
    }
  }

  async function showAndReadImage(file){
    console.log('showAndReadImage',file) // todo: remove log
    reader.readAsDataURL(file)
    // const result = await doOCR(file)
    // whenRecognized(result)
    return await doOCR(file).then(whenRecognized, console.error.bind(console, 'OCR error'))
  }

  function onReaderLoad(e){
    img.src = e.target.result;
  }

  async function doOCR(image){
    // console.log('doOCR',image) // todo: remove log
    // const worker = createWorker()
    // await worker.load()
    // await worker.loadLanguage('eng')
    // await worker.initialize('eng')
    // return await worker.recognize(image)
    return scheduler.addJob('recognize', image)
  }

  function whenRecognized(result) {
    console.log('whenRecognized',result) // todo: remove log
    const { data: { text } } = result
    pre.textContent = text
  }

  function logStamp(start){
    time.textContent = `t = ${Math.round((Date.now()-start)/1000)}s`
    console.log('\tt',(Date.now()-start)/1000) // todo: remove log
  }

})()
