/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let classList = []

const printClass = () => {
  document.getElementById('existingClassList').innerHTML = ''

  let str_builder = ''
  classList.map((value, index) => {
    let template = `
    <div class="row class-form" id="classDiv${index}">
      <div class="col-md-4 col-sm-12">
        <div class="row m-0">
          <div class="col-2 d-flex align-items-center">
            <label class="count-label">${index + 1}.</label>
          </div>
          <div class="col-10">
            <input type="text" class="form-control" id="className${
              index + 1
            }" name="className${index + 1}" data="${index}" value="${
      value.class_name
    }" placeholder="Nama Kelas">
          </div>
        </div>
      </div>
      <div class="col-md-7 col-sm-12">
        <textarea class="form-control" id="studentList${
          index + 1
        }" name="studentLis${
      index + 1
    }1" rows="6" data="${index}" placeholder="Nama-nama murid...">${value.students.join(
      '\n'
    )}</textarea>
      </div>
      <div class="col-md-1 col-sm-12 align-items-end">
        <button class="btn btn-danger m-1" data="${index}" id="deleteBtn${
      index + 1
    }">x</button>
      </div>
    </div>
    `
    str_builder += template
  })
  document.getElementById('existingClassList').innerHTML = str_builder

  // Re-set the delete action
  document
    .getElementById('existingClassList')
    .querySelectorAll('[id^="deleteBtn"]')
    .forEach((btn) => {
      btn.addEventListener('click', (event) => {
        let index = event.target.getAttribute('data')
        let removed = classList.splice(index, 1)[0]
        document.querySelector(`.class-form#classDiv${index}`).remove()
      })
    })

  // Reset the onchange values
  // classname
  document
    .getElementById('existingClassList')
    .querySelectorAll('[id^="className"]')
    .forEach((input) => {
      input.addEventListener('change', (event) => {
        let index = event.target.getAttribute('data')
        let newValue = event.target.value.trim()
        classList[index].class_name = newValue
      })
    })
  // student list
  document
    .getElementById('existingClassList')
    .querySelectorAll('[id^="studentList"]')
    .forEach((textarea) => {
      textarea.addEventListener('change', (event) => {
        let index = event.target.getAttribute('data')
        let newValue = event.target.value.trim()
        classList[index].students = newValue.split('\n')
      })
    })
}

document.getElementById('add-btn').addEventListener('click', () => {
  let className = document.getElementById('newClassName')
  let studentList = document.getElementById('newStudentList')
  classList.push({
    class_name: className.value.trim(),
    students: studentList.value.trim().split('\n'),
  })
  printClass()
  className.value = ''
  studentList.value = ''
})

// Import File input
document
  .getElementById('importFileInput')
  .addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (file) {
      var reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = (evt) => {
        try {
          classList = JSON.parse(evt.target.result)
        } catch (error) {
          event.target.value = null
          return
        }
        printClass()
        infoBar.show(null, 'Import fail berjaya')
      }
    }
  })

// Import Button
document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('importFileInput').click()
})

// Export Button
document.getElementById('export-btn').addEventListener('click', () => {
  var dataStr = 'data:text/json;charset=utf-8,' + JSON.stringify(classList)
  var dlAnchorElem = document.createElement('a')
  dlAnchorElem.setAttribute('href', dataStr)
  dlAnchorElem.setAttribute(
    'download',
    'Exported_' +
      'Semak_Kelas_' +
      new Date().toDateString().slice(4).replace(/\s+/g, '_') +
      '.json'
  )
  dlAnchorElem.click()
})

api.ipcRenderer.invoke('getStoreValue', 'classList').then((result) => {
  if (!result) return

  classList = result
  printClass()
})

document.getElementById('save-btn').addEventListener('click', () => {
  classList = classList.map((c) => {
    c.students = c.students.map((s) => s.trim()).sort()
    return c
  })
  api.ipcRenderer.invoke('setStoreValue', 'classList', classList).then(() => {
    successBar.show()
  })
})

document.getElementById('remove-all-btn').addEventListener('click', () => {
  api.dialog
    .showMessageBox({
      title: 'Remove All',
      type: 'warning',
      message: 'Are you sure to remove all data?',
      detail: 'This process cannot be undone.',
      buttons: ['Yes', 'No'],
    })
    .then((response) => {
      if (response && response.response === 0) {
        // Yes
        api.ipcRenderer.invoke('deleteStoreValue', 'classList').then(() => {
          infoBar.show(null, 'Semua maklumat telah dipadam')
          classList = []
          printClass()
        })
      }
    })
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
  message: 'Maklumat telah disimpan',
  timeout: 2000,
  class: ['bg-gradient-green'],
})
let infoBar = new Snackbar({
  title: 'Successful',
  message: 'Proses berjaya',
  timeout: 2000,
  class: ['bg-gradient-blue'],
})
let failedBar = new Snackbar({
  title: 'Failed',
  message: 'Maklumat tidak berjaya dikemaskini',
  timeout: 2000,
  class: ['bg-gradient-red'],
})
