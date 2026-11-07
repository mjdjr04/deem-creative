import fs from 'node:fs'
import vm from 'node:vm'

const noop = () => {}

function defaultStubs() {
  return {
    CalendarApp: {},
    Calendar: {},
    Logger: { log: noop },
    console,
    PropertiesService: {},
    UrlFetchApp: {},
    MailApp: {},
    Utilities: {},
    ContentService: {},
    HtmlService: {},
  }
}

// Runs an Apps Script .gs file in a vm sandbox. Top-level functions and `var`
// declarations become properties of the returned context.
export function loadGs(path, overrides = {}) {
  const sandbox = { ...defaultStubs(), ...overrides }
  const ctx = vm.createContext(sandbox)
  vm.runInContext(fs.readFileSync(path, 'utf8'), ctx, { filename: path })
  return sandbox
}
