/* eslint-disable no-unused-vars */

const _SnackbarDefaultOpts = {
  class: [],
  position: 'top-middle',
  background: '#131313',
  title: 'This is Title',
  message: 'This is messsage <html supported>',
  timeout: 300,
  onClick: () => {},
}
const _SnackbarConfig = {
  id: 'snackbar',
  className: 'snackbar',
  fadeDuration: 300,
}
let _SnackbarCount = 1
const Snackbar = class {
  /**
   * @param default_options Options used by default
   **/
  constructor(opts) {
    this.options = opts || _SnackbarDefaultOpts
    // Handles options to default value if not pass
    Object.keys(_SnackbarDefaultOpts).forEach((key) => {
      if (this.options[key] === undefined && _SnackbarDefaultOpts[key]) {
        this.options[key] = _SnackbarDefaultOpts[key]
      }
      // Handle default timeout to default 300 minimum
      if (key === 'timeout' && this.options[key] < _SnackbarDefaultOpts[key]) {
        this.options[key] = _SnackbarDefaultOpts[key]
      }
    })

    // Add elements
    // Container
    this.divEL = document.createElement('div')
    this.divEL.id = _SnackbarConfig.id + _SnackbarCount
    this.divEL.className =
      _SnackbarConfig.className + ' ' + this.options.class.join(' ')
    // Title
    this.titleEL = document.createElement('div')
    this.titleEL.className = 'title'
    this.titleEL.innerText = this.options.title
    // Message
    this.messageEL = document.createElement('div')
    this.messageEL.className = 'message'
    this.messageEL.innerHTML = this.options.message
    // Add listeners
    this.divEL.addEventListener('click', (event) => {
      this.onClick(event)
      this.fadeOut()
    })
    // Add to document body
    this.divEL.appendChild(this.titleEL)
    this.divEL.appendChild(this.messageEL)
    document.body.appendChild(this.divEL)
    // Fix positioning
    this.divEL.style.marginLeft = -this.divEL.offsetWidth / 2 + 'px'
    _SnackbarCount++
  }

  show(title, message) {
    if (title && title !== '') {
      this.divEL.querySelector('.title').innerHTML = title
    }
    if (message && message !== '') {
      this.divEL.querySelector('.message').innerHTML = message
    }
    // Add the "show" class to DIV
    if (this.divEL.classList.contains('show')) this.fadeOut()
    else this.fadeIn()

    if (this.options.timeout > _SnackbarDefaultOpts.timeout) {
      setTimeout(() => {
        this.fadeOut()
      }, this.options.timeout + _SnackbarConfig.fadeDuration)
    }
  }

  onClick(event) {
    this.options.onClick(event)
  }

  fadeIn() {
    this.divEL.classList.add('show')
    this.divEL.classList.add('fadein')
    setTimeout(() => {
      this.divEL.classList.remove('fadein')
    }, _SnackbarConfig.fadeDuration)
  }

  fadeOut() {
    this.divEL.classList.add('fadeout')
    setTimeout(() => {
      this.divEL.classList.remove('fadeout')
      this.divEL.classList.remove('show')
    }, _SnackbarConfig.fadeDuration)
  }
}
const initDoc = () => {}
window.addEventListener('DOMContentLoaded', initDoc)
