// Description:
//   Catalyst Cloud status updates for Hubot
//
// Configuration:
//   HUBOT_CATALYSTCLOUD_STATUS_URL - Catalyst Cloud Status URL
//   HUBOT_CATALYSTCLOUD_STATUS_NOTIFY_INTERVAL - Seconds between checks
//   HUBOT_CATALYSTCLOUD_STATUS_ROOMS - Rooms to announce cloud status to
//   HUBOT_CATALYSTCLOUD_STATUS_ANNOUNCE - Set to false or 0 to disable
//   HUBOT_CATALYSTCLOUD_STATUS_IGNORE - @TODO Regex of keys / values to ignore
//
// Commands:
//   hubot cloud status

module.exports = function(robot) {
  let request = require('request-promise')
  let domparser = require('xmldom-qsa').DOMParser
  let diff = require('object-diff')

  let URL = process.env.HUBOT_CATALYSTCLOUD_STATUS_URL || 'https://catalystcloud.nz/support/status/'
  let notifyRooms = process.env.HUBOT_CATALYSTCLOUD_STATUS_NOTIFY_ROOMS || ''
  let announce = process.env.HUBOT_CATALYSTCLOUD_STATUS_ANNOUNCE
  let notifyInterval = (process.env.HUBOT_CATALYSTCLOUD_STATUS_NOTIFY_INTERVAL || 60) * 1000
  if (typeof announce === 'undefined') { announce = 1 } // Default to active

  // Extract statuses from the status page.
  // <h4>Region name</h4><p>Current status</p>
  let parseStatuses = (htmlString) => {
    let dom = new domparser().parseFromString(htmlString)
    let headings = dom.getElementsByTagName('h4')
    let statuses = {}
    for (var i = 0; i < headings.length; i++) {
      statuses[headings[i].textContent] = headings[i].nextSibling.textContent
    }
    return statuses
  }

  // Filter so we only announce status changes.
  let changedStatuses = (statuses) => {
    let prevStatuses = robot.brain.get('hubotCatalystCloudStatus') || {}
    robot.brain.set('hubotCatalystCloudStatus', statuses)
    return diff(prevStatuses, statuses)
  }

  // Change statuses randomly for demo.
  let simulateStatuses = (statuses) => {
    var problems = [
      'nuked',
      'pwned by Cerealkiller',
      'zombie outbreak',
      'down for upgrades',
      'up for downgrades',
      'flooding',
      'regionwide hangover',
      'fire outbreak',
      'lost a rap battle',
      'just ... messed up',
      'cannae take nae mair',
    ]
    for (let key of Object.keys(statuses)) {
      if (key != 'Planned maintenance' && Math.random() < 0.2) {
        statuses[key] = problems[Math.floor(Math.random()*problems.length)]
      }
    }
    return statuses
  }

  // Monitor for status changes, announce to rooms.
  let monitorStatuses = () => {
    request(URL)
      .then((htmlString) => {
        let statuses = parseStatuses(htmlString)
        // statuses = simulateStatuses(statuses)
        statuses = changedStatuses(statuses)
        announce = []
        for (let key of Object.keys(statuses)) {
          announce.push(`* ${key}: ${statuses[key]}`)
        }
        for (let room of notifyRooms.split(',')) {
          robot.messageRoom(room, announce.join('\n'))
        }
      })
      .catch((err) => {
        console.log(err, 'error in hubot-catalystcloud response')
      })
  }
  if (notifyRooms.length && announce) {
    let monitorInterval = setInterval(monitorStatuses, notifyInterval)
  }

  // Respond to enquiries.
  robot.respond(/cloud status/i, (msg) => {
    request(URL)
      .then((htmlString) => {
        let statuses = parseStatuses(htmlString)
        statuses = simulateStatuses(statuses)
        reply = []
        for (let key of Object.keys(statuses)) {
          reply.push(`* ${key}: ${statuses[key]}`)
        }
        msg.reply(reply.join('\n'))
      })
      .catch((err) => {
        console.log(err, 'error in hubot-catalystcloud response')
      })
  })

}
