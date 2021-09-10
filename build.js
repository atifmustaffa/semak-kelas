const electronInstaller = require('electron-winstaller')
const path = require('path')

const build = async () => {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(
        __dirname,
        'release-builds/Semak_Kelas-win32-x64'
      ),
      outputDirectory: path.join(
        __dirname,
        'release-installers/Semak_Kelas-win32-x64'
      ),
      authors: 'Atif Mustaffa',
      exe: 'Semak_Kelas.exe',
      iconUrl: path.join(__dirname, 'assets/student.ico'),
    })
    console.log('Finish building installer!')
  } catch (e) {
    console.log(`No dice: ${e.message}`)
  }
}

build()
