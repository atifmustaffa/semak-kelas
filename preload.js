// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer } = require('electron')
const { BrowserWindow } = require('@electron/remote')

let mainWindow = undefined

window.addEventListener('DOMContentLoaded', () => {
  mainWindow = BrowserWindow.getAllWindows()[0]
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  // button print
  const printBtn = document.getElementById('print-btn')
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      let content = document.getElementById('view-data').innerHTML
      let printDiv = document.getElementById('print-view-data')
      printDiv.innerHTML = content
      printDiv.classList.remove('hidden')
      // Hide header
      document.querySelectorAll('.container-lg').forEach((element) => {
        element.classList.add('hidden')
      })

      var options = {
        silent: false,
        printBackground: true,
        color: false,
        margin: {
          marginType: 'printableArea',
        },
        landscape: true,
        pagesPerSheet: 1,
        collate: false,
        copies: 1,
      }
      mainWindow.webContents.print(options, (success, failureReason) => {
        if (!success) console.log(failureReason)
        console.log('Print Initiated')

        // Show header
        document.querySelectorAll('.container-lg').forEach((element) => {
          element.classList.remove('hidden')
        })

        printDiv.classList.add('hidden')
      })
    })
  }
})

contextBridge.exposeInMainWorld('api', {
  ipcRenderer: ipcRenderer,
})
