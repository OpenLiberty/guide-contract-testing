/*******************************************************************************
* Copyright (c) 2018 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License 2.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
*******************************************************************************/
/* eslint-disable no-use-before-define */
function displayMetrics () {
  getSystemMetrics()
}

function getSystemMetrics () {
  const url = 'http://localhost:9080/metrics'
  const req = new XMLHttpRequest()

  const metricToDisplay = {}
  metricToDisplay.application_getProperties_total = 'Request Count'
  metricToDisplay.application_io_openliberty_sample_system_SystemResource_getPropertiesTime_one_min_rate_per_second = 'Min Request Time (ms)'
  metricToDisplay.application_io_openliberty_sample_system_SystemResource_getPropertiesTime_mean_seconds = 'Mean Request Time (ms)'
  metricToDisplay.application_io_openliberty_sample_system_SystemResource_getPropertiesTime_max_seconds = 'Max Request Time (ms)'
  metricToDisplay.base_cpu_processCpuLoad_percent = 'System CPU Usage (%)'
  metricToDisplay.base_memory_usedHeap_bytes = 'System Heap Usage (MB)'

  let metricToMatch = '^('
  for (const metricKey in metricToDisplay) {
    metricToMatch += metricKey + '|'
  }
  // remove the last |
  metricToMatch = metricToMatch.substring(0, metricToMatch.length - 1)
  metricToMatch += ')\\s*(\\S*)$'

  req.onreadystatechange = function () {
    if (req.readyState !== 4) return // Not there yet
    if (req.status !== 200) {
      document.getElementById('metricsText').innerHTML = req.statusText
      return
    }

    const resp = req.responseText
    const regexpToMatch = new RegExp(metricToMatch, 'gm')
    const matchMetrics = resp.match(regexpToMatch)

    const keyValPairs = {}
    for (const metricKey in metricToDisplay) {
      matchMetrics.forEach(function (line) {
        const keyToMatch = metricKey + ' (.*)'
        const keyVal = line.match(new RegExp(keyToMatch))
        if (keyVal) {
          let val = keyVal[1]
          if (metricKey.indexOf('application_io_openliberty_sample_system_SystemResource_getPropertiesTime') === 0) {
            val = val * 1000
          } else if (metricKey.indexOf('base_memory_usedHeap_bytes') === 0) {
            val = val / 1000000
          }
          keyValPairs[metricToDisplay[metricKey]] = val
        }
      })
    }

    const table = document.getElementById('metricsTableBody')
    for (const key in keyValPairs) {
      const row = document.createElement('tr')
      const keyData = document.createElement('td')
      keyData.innerText = key
      const valueData = document.createElement('td')
      valueData.innerText = keyValPairs[key]
      row.appendChild(keyData)
      row.appendChild(valueData)
      table.appendChild(row)
    }

    addSourceRow(table, url)
  }

  req.open('GET', url, true)
  req.send()
}

function getSystemPropertiesRequest () {
  const propToDisplay = ['java.vendor', 'java.version', 'user.name', 'os.name', 'wlp.install.dir', 'wlp.server.name']
  const url = 'http://localhost:9080/system/properties'
  const req = new XMLHttpRequest()
  const table = document.getElementById('systemPropertiesTable')
  // Create the callback:
  req.onreadystatechange = function () {
    if (req.readyState !== 4) return // Not there yet
    displayMetrics()
    if (req.status !== 200) {
      table.innerHTML = ''
      const row = document.createElement('tr')
      const th = document.createElement('th')
      th.innerText = req.statusText
      row.appendChild(th)
      table.appendChild(row)

      addSourceRow(table, url)
      return
    }
    // Request successful, read the response
    const resp = JSON.parse(req.responseText)
    for (let i = 0; i < propToDisplay.length; i++) {
      const key = propToDisplay[i]
      if (Object.prototype.hasOwnProperty.call(resp, key)) {
        row = document.createElement('tr')
        const keyData = document.createElement('td')
        keyData.innerText = key
        const valueData = document.createElement('td')
        valueData.innerText = resp[key]
        row.appendChild(keyData)
        row.appendChild(valueData)
        table.appendChild(row)
      }
    }

    addSourceRow(table, url)
  }
  req.open('GET', url, true)
  req.send()
}

function getHealth () {
  const url = 'http://localhost:9080/health'
  const req = new XMLHttpRequest()

  const healthBox = document.getElementById('healthBox')
  const serviceName = document.getElementById('serviceName')
  const healthStatus = document.getElementById('serviceStatus')
  const healthIcon = document.getElementById('healthStatusIconImage')

  req.onreadystatechange = function () {
    if (req.readyState !== 4) return // Not there yet

    // Request successful, read the response
    if (req.responseText) {
      const resp = JSON.parse(req.responseText)

      resp.checks.forEach(function (service) {
        serviceName.innerText = service.name
        healthStatus.innerText = service.status

        if (service.status === 'UP') {
          healthBox.style.backgroundColor = '#f0f7e1'
          healthIcon.setAttribute('src', 'img/systemUp.svg')
        } else {
          healthBox.style.backgroundColor = '#fef7f2'
          healthIcon.setAttribute('src', 'img/systemDown.svg')
        }
      })
    }
    const table = document.getElementById('healthTable')

    addSourceRow(table, url)
  }
  req.open('GET', url, true)
  req.send()
}

function getConfigPropertiesRequest () {
  const url = 'http://localhost:9080/config'
  const req = new XMLHttpRequest()

  const configToDisplay = {}
  configToDisplay.io_openliberty_sample_system_inMaintenance = 'System In Maintenance'
  configToDisplay.io_openliberty_sample_testConfigOverwrite = 'Test Config Overwrite'
  configToDisplay.io_openliberty_sample_port_number = 'Port Number'
  // Create the callback:
  req.onreadystatechange = function () {
    if (req.readyState !== 4) return // Not there yet
    if (req.status !== 200) {
      return
    }

    // Request successful, read the response
    const resp = JSON.parse(req.responseText)
    const configProps = resp.ConfigProperties
    const table = document.getElementById('configTableBody')
    for (const key in configProps) {
      const row = document.createElement('tr')
      const keyData = document.createElement('td')
      keyData.innerText = configToDisplay[key]
      const valueData = document.createElement('td')
      valueData.innerText = configProps[key]
      row.appendChild(keyData)
      row.appendChild(valueData)
      table.appendChild(row)
    }

    addSourceRow(table, url)
  }
  req.open('GET', url, true)
  req.send()
}

function toggle (e) {
  let callerElement
  if (!e) {
    if (window.event) {
      e = window.event
      callerElement = e.currentTarget
    } else {
      callerElement = window.toggle.caller.arguments[0].currentTarget // for firefox
    }
  }

  const classes = callerElement.parentElement.classList
  const collapsed = classes.contains('collapsed')
  const caretImg = callerElement.getElementsByClassName('caret')[0]
  const caretImgSrc = caretImg.getAttribute('src')
  if (collapsed) { // expand the section
    classes.replace('collapsed', 'expanded')
    caretImg.setAttribute('src', caretImgSrc.replace('down', 'up'))
  } else { // collapse the section
    classes.replace('expanded', 'collapsed')
    caretImg.setAttribute('src', caretImgSrc.replace('up', 'down'))
  }
}

function addSourceRow (table, url) {
  const sourceRow = document.createElement('tr')
  sourceRow.classList.add('sourceRow')
  const sourceText = document.createElement('td')
  sourceText.setAttribute('colspan', '100%')
  sourceText.innerHTML = "API Source: <a href='" + url + "'>" + url + '</a>'
  sourceRow.appendChild(sourceText)
  table.appendChild(sourceRow)
}
/* eslint-disable no-use-before-define */
