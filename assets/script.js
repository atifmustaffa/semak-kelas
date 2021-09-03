/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.')
}

let names = {}

let classList = []
api.ipcRenderer.invoke('getStoreValue', 'classList').then((result) => {
  if (!result) return false
  console.log('retrieved', result.length)
  // classList = result
  result.map((cls, index) => {
    names[cls.class_name.replace(/\s+/g, '-')] = cls.students_str
      .split('\n')
      .sort()
  })
})

const csv2json = (str, delimiter = ',') => {
  // Special for google meet auto attendance; skip first few lines
  const GoogleMeetAutoAttendanceUrl =
    'https://chrome.google.com/webstore/detail/google-meet-attendance-li/appcnhiefcidclcdjeahgklghghihfok'
  const linesToRemove = str
    .split('\n')
    .slice(0, 4)
    .join('\n')
    .includes(GoogleMeetAutoAttendanceUrl)
    ? 4
    : 0
  let values = str.split('\n').slice(linesToRemove).join('\n')
  const titles = values.slice(0, values.indexOf('\n')).split(delimiter)
  const rows = values.slice(values.indexOf('\n') + 1).split('\n')
  return {
    info: str.split('\n').slice(0, linesToRemove).join('\n'),
    values: rows.map((row) => {
      const values = row.split(delimiter)
      return titles.reduce(
        (object, curr, i) => ((object[curr] = values[i]), object),
        {}
      )
    }),
  }
}

const json2csv = (data, delimiter = ',') => {
  const GoogleMeetAutoAttendanceUrl =
    'https://chrome.google.com/webstore/detail/google-meet-attendance-li/appcnhiefcidclcdjeahgklghghihfok'
  const linesToAppend = updatedContents.split('\n').slice(0, 4).join('\n')
  var json = data
  var fields = Object.keys(json[0])
  var replacer = function (key, value) {
    return value === null ? '' : value
  }
  var csv = json.map(function (row) {
    return fields
      .map(function (fieldName) {
        return JSON.stringify(row[fieldName].trim(), replacer)
      })
      .join(delimiter)
  })
  csv.unshift(fields.join(delimiter)) // add header column
  csv = csv.join('\n')
  return (
    (linesToAppend.includes(GoogleMeetAutoAttendanceUrl)
      ? linesToAppend + '\r\n'
      : '') + csv
  )
}

const lineSeparator = '\n'
const columnSeparator = ','
const aliasSeparator = ' @ '

const checkNames = (csvStr) => {
  return new Promise((resolve, reject) => {
    let rowsStr = Array()
    let rows = csvStr.split(lineSeparator)
    for (let x = 0; x < rows.length; x++) {
      let keys = Object.keys(names)
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        let foundIndex = -1
        for (let n of names[key]) {
          let aliases = n.split(aliasSeparator)
          for (let [index, a] of aliases.entries()) {
            let alias = undefined
            foundIndex = rows[x]
              .replace(/,/g, ' ')
              .toLowerCase()
              .indexOf(a.toLowerCase())
            if (foundIndex >= 0) {
              alias = foundIndex >= 0 && index > 0 ? aliases[0] : undefined
              rows[x] =
                ' (' + key + ') ' + (alias ? alias + ' - ' : '') + rows[x]
              break
            }
          }
          if (foundIndex >= 0) break
        }
        if (foundIndex >= 0) break
      }
      rows[x] = rows[x].replace(/\"/g, '')
      rowsStr.push(rows[x])
    }
    resolve(rowsStr.join(lineSeparator))
  })
}

const appendID = (values) => {
  return values.map((v, index) => {
    if (v['id']) {
      //   console.log(index, 'has id')
      const tempId = v['id']
      delete v['id']
      v = { id: tempId, ...v }
    } else {
      v = { id: '' + (index + 1), ...v }
    }
    return v
  })
}

const printElem = (elem, styles = '') => {
  var mywindow = window.open('', 'PRINT', 'height=800,width=900')

  mywindow.document.write('<html><head><title>' + document.title + '</title>')
  mywindow.document.write('</head><body >')
  mywindow.document.write(elem.innerHTML)
  mywindow.document.write('<style>' + styles + '</style>')
  mywindow.document.write('</body></html>')

  mywindow.document.close() // necessary for IE >= 10
  mywindow.focus() // necessary for IE >= 10*/

  mywindow.print()
  mywindow.close()

  return true
}

let uploadedFile = null
let fileContents = null
let updatedContents = null
// File Upload
document.getElementById('file-upload').addEventListener('change', (event) => {
  document.getElementById('view-data').className = 'view-data hidden'
  document.getElementById('download-btn').disabled = true
  document.getElementById('view-btn').disabled = true
  document.getElementById('print-btn').disabled = true
  updatedContents = null
  const file = event.target.files[0]
  if (file) {
    uploadedFile = file
    var reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = function (evt) {
      fileContents = evt.target.result
      checkNames(fileContents).then((data) => {
        updatedContents = data
        document.getElementById('download-btn').disabled = false
        successBar.show()
        setTimeout(() => {
          createView()
        }, 500)
      })
    }
    reader.onerror = function (evt) {
      document.getElementById('status-info').innerHTML =
        'Ralat: Fail tidak dapat diproses.'
      document.getElementById('status-info').className = 'status-info failed'
    }
  }
})
// Check Button
const createView = () => {
  if (uploadedFile && updatedContents) {
    let { info, values } = csv2json(updatedContents)

    values = appendID(values)
    values.pop()

    updatedContents = json2csv(values)

    let meetingCodeRegex = 'Meeting code: '
    let meetingCodeLines =
      info.split('\n').find((phrase) => phrase.includes(meetingCodeRegex)) || ''
    let meetingCode = meetingCodeLines
      .slice(
        meetingCodeLines.indexOf(meetingCodeRegex) + meetingCodeRegex.length,
        meetingCodeLines.indexOf(',')
      )
      .replace(/(^\"+|\"+$)/g, '')
    let createdTimeRegex = 'Created on '
    let createdTimeLines =
      info.split('\n').find((phrase) => phrase.includes(createdTimeRegex)) || ''
    let createdTime = createdTimeLines
      .slice(
        createdTimeLines.indexOf(createdTimeRegex) + createdTimeRegex.length,
        createdTimeLines.indexOf(',')
      )
      .replace(/(^\"+|\"+$)/g, '')
    document.getElementsByClassName('view-data')[0].classList.remove('hidden')
    document.getElementById('filename').innerHTML =
      '<strong>' +
      'Filename: ' +
      '</strong>' +
      (uploadedFile.name || 'Not found')
    document.getElementById('meeting-code').innerHTML =
      '<strong>' + meetingCodeRegex + '</strong>' + (meetingCode || 'Not found')
    document.getElementById('created-time').innerHTML =
      '<strong>' +
      createdTimeRegex.trim() +
      ': </strong>' +
      (createdTime || 'Not found')

    // Print value
    let tableElement = document.getElementById('name-table')
    tableElement.innerHTML = ''

    // Add headers
    let thead = document.createElement('thead')
    thead.className = 'table-light'

    let headerRow = document.createElement('tr')
    let keys = Object.keys(values[0]).filter((k) => k !== '')
    keys.forEach((key) => {
      let th = document.createElement('th')
      th.innerText = key
        .trim()
        .replace(/(^\"+|\"+$)/g, '')
        .trim()
      headerRow.append(th)
    })
    thead.append(headerRow)
    tableElement.append(thead)

    // Add values
    let tbody = document.createElement('tbody')
    tbody.className = ''

    values.forEach((val) => {
      let tr = document.createElement('tr')
      keys.forEach((key) => {
        if (val[key] && val[key].trim() !== '') {
          let td = document.createElement('td')
          td.innerText = val[key].trim()
          tr.append(td)
        }
      })
      tbody.append(tr)
    })
    tableElement.append(tbody)
    document.getElementById('print-btn').disabled = false
  }
}
// Download Button
document.getElementById('download-btn').addEventListener('click', () => {
  if (uploadedFile && updatedContents) {
    var dataStr = 'data:text/csv;charset=utf-8,' + encodeURI(updatedContents)
    var dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', 'Checked_' + uploadedFile.name)
    dlAnchorElem.click()
  }
})

// Enable BS Tooltip
var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
)
tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

let successBar = new Snackbar({
  title: 'Successful',
  message: 'Fail berjaya dikemaskini',
  timeout: 2000,
  class: ['bg-gradient-green'],
})
let failedBar = new Snackbar({
  title: 'Failed',
  message: 'Fail tidak berjaya dikemaskini',
  timeout: 2000,
  class: ['bg-gradient-red'],
})
