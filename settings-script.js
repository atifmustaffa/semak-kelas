// eslint-disable-next-line no-undef
let _api = api
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
    }1" rows="6" data="${index}" placeholder="Nama-nama murid...">${
      value.students_str
    }</textarea>
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
        console.log('delete class', index)
        classList.splice(index, 1)
        document.querySelector(`.class-form#classDiv${index}`).remove()
        console.log(classList)
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
        classList[index].students_str = newValue
      })
    })
}

document.getElementById('add-btn').addEventListener('click', () => {
  let className = document.getElementById('newClassName')
  let studentList = document.getElementById('newStudentList')
  classList.push({
    class_name: className.value.trim(),
    students_str: studentList.value.trim(),
  })
  printClass()
  className.value = ''
  studentList.value = ''
})

_api.ipcRenderer.invoke('getStoreValue', 'classList').then((result) => {
  if (!result) return false
  console.log('retrieved', result.length)
  classList = result
  printClass()
})

document.getElementById('save-btn').addEventListener('click', () => {
  _api.ipcRenderer.invoke('setStoreValue', 'classList', classList).then(() => {
    console.log('stored')
  })
})

document.getElementById('remove-all-btn').addEventListener('click', () => {
  _api.ipcRenderer.invoke('deleteStoreValue', 'classList').then(() => {
    console.log('removed')
    classList = []
    printClass()
  })
})
