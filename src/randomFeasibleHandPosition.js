const HandPosition = require("./HandPosition")

const lp = require('./lilypond')
const pitch = require('./pitch')

function randomHandPosition({
  numberOfFingers = 4,
  minFingerStretch = 0, // in frets
  maxFingerStretch = 2, // in frets
  maxHandStretch = 2, // in frets
  numberOfStrings = 6,
  numberOfFrets = 12,
  pOmitFinger = 1/10, // probability of omitting each finger
  pOpenString = 1/2, // probability of playing an open string
}={}) {
  // choose frets for each finger
  let fingerStretches
  let handStretch
  do {
    fingerStretches = []
    handStretch = 0
    for(let i=1; i<numberOfFingers; i++) {
      let stretch = minFingerStretch + Math.floor(Math.random()*(maxFingerStretch-minFingerStretch+1))
      fingerStretches.push(stretch)
      handStretch += stretch
    }
  } while(handStretch > maxHandStretch)

  let fingers = []
  for(let i=0; i<numberOfFingers; i++)
    fingers[i] = {}

  // choose position on fretboard
  let handPosition = Math.floor(Math.random() * (numberOfFrets-handStretch-1))+1
  fingers[0].fret = handPosition
  for(let i=0; i<fingerStretches.length; i++) {
    let stretch = fingerStretches[i]
    fingers[i+1].fret = (fingers[i].fret + stretch)
  }

  // choose strings for each finger
  let stringPool = []
  for(let i=0; i<numberOfStrings; i++)
    stringPool.push(i)
  stringPool = stringPool.sort(() => Math.random()*2-1)

  for(let finger of fingers) {
    if(Math.random() < pOmitFinger) {
      // omit this finger
      finger.string = null
      finger.fret = null
    } else {
      // choose a string for this finger
      finger.string = stringPool.pop()
    }
  }

  // decide what to do with open strings
  let openStrings = stringPool
    .filter(() => Math.random() < pOpenString)
    .sort((A, B) => A-B)

  return new HandPosition({
    fingers: fingers,
    openStrings:openStrings
  })
}

module.exports = randomHandPosition
