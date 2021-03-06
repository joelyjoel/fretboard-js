const {standardEADGBE} = require('./tunings')

class HandPosition {
  constructor({fingers, openStrings=[]}) {
    this.fingers = fingers // an array of finger positions
    this.openStrings = openStrings // a list of open strings
    // ^ should replace with .soundingStrings and make open string a getter
  }

  duplicate() {
    return new HandPosition({
      fingers: this.fingers.map(({fret, string}) => ({fret, string})),
      openStrings: this.openStrings.slice()
    })
  }

  static empty(numberOfFingers=4) {
    let fingers = []
    for(let finger=0; finger<numberOfFingers; finger++)
      fingers.push({fret:null, string: null})

    return new HandPosition({fingers: fingers, openStrings:[]})
  }

  static compare(A, B) {
    // return true if A and B are equal
    if(A.fingers.length != B.fingers.length)
      return false
    for(let n=0; n<A.fingers.length; n++) {
      if(A.fingers[n].fret != B.fingers[n].fret)
        return false
      if(A.fingers[n].string != B.fingers[n].string)
        return false
    }

    if(A.openStrings.length != B.openStrings.length)
      return false
    for(let i in A.openStrings)
      if(A.openStrings[i] != B.openStrings[i])
        return false

    return true
  }

  // pitch

  // movement
  liftFinger(fingerNumber) {
    let copy = this.duplicate()
    copy.fingers[fingerNumber] = {fret: null, string:null}
    return copy
  }

  moveFinger(fingerNumber, {fret, string}) {
    let copy = this.duplicate()
    copy.fingers[fingerNumber] = {fret: fret, string: string}
    return copy
  }

  // measurements
  get empty() {
    for(let {fret} of this.fingers)
      if(fret != null)
        return false
    return true
  }
  get lowestFrettedFinger() {
    for(let i=0; i<this.fingers.length; i++)
      if(this.fingers[i].fret != null)
        return i

    // Otherwise,
    return null
  }
  get highestFrettedFinger() {
    for(let i=this.fingers.length-1; i >= 0; i--)
      if(this.fingers[i].fret != null)
        return i

    // Otherwise,
    return null
  }

  get lowestFret() {
    let finger = this.lowestFrettedFinger
    if(finger != null)
      return this.fingers[finger].fret
    else
      return null
  }
  get highestFret() {
    let finger = this.highestFrettedFinger
    if(finger != null)
      return this.fingers[finger].fret
    else
      return null
  }

  get playingPosition() {
    let lowestFinger = this.lowestFrettedFinger
    let lowestFret = this.lowestFret

    if(lowestFret == null || lowestFinger == null)
      return null
    else
      return lowestFret
  }

  get width() {
    let low = this.lowestFret
    let high = this.highestFret
    if(low != undefined && high != undefined)
      return high-low
    else
      return null
  }

  get liftedFingerNumbers() {
    let list = []
    for(let i=0; i<this.fingers.length; i++)
      if(this.fingers[i].fret == null)
        list.push(i)

    return list
  }
  get placedFingerNumbers() {
    let list = []
    for(let i=0; i<this.fingers.length; i++)
      if(this.fingers[i].fret != null)
        list.push(i)

    return list
  }

  get numberOfEngagedFingers() {
    return this.placedFingerNumbers.length
  }

  getEngagedStrings(numberOfStrings=6) {
    let byString = this.fretsByString(numberOfStrings)
    let list = []
    for(let i=0; i<byString.length; i++)
      if(byString[i] != null)
        list.push(i)
    return list
  }

  // formatting
  fretsByString(numberOfStrings=6) {
    let out = new Array(numberOfStrings).fill(null)
    for(let string of this.openStrings)
      out[string] = 0

    for(let {fret, string} of this.fingers)
      if(fret != null && (!out[string] || fret > out[string]))
        out[string] = fret

    return out
  }
  fretsAndFingersByString(numberOfStrings=6) {
    let byString = new Array(numberOfStrings).fill(null)
    for(let string of this.openStrings)
      byString[string] = {fret:0, fingerNumber:null}

    for(let n=0; n<this.fingers.length; n++) {
      let finger = this.fingers[n]
      let {fret, string} = finger
      if(fret != null && (!byString[string] || fret > byString[string].fret))
        byString[string] = {fret: fret, fingerNumber: n}
    }

    return byString
  }
  lilypondFretDiagram(numberOfStrings=6) {
    let byString = []
    for(let n=0; n<this.fingers.length; n++) {
      let finger = this.fingers[n]
      let {fret, string} = finger
      if(fret != null && (!byString[string] || fret > byString[string].fret))
        byString[finger.string] = {fret: fret, fingerNumber: n}
    }

    for(let string=0; string<numberOfStrings; string++)
      if(byString[string])
        byString[string] = byString[string].fret + '-' + (byString[string].fingerNumber+1)
      else {
        if(this.openStrings.includes(string))
          byString[string] = 'o'
        else
          byString[string] = 'x'
      }

    return "\\markup { \\fret-diagram-terse #\"" + byString.join(';')+';' + "\" }"
  }

  pitches(tuning=standardEADGBE) {
    let list = []
    let byString = this.fretsAndFingersByString(tuning.length)
    for(let i in byString) {
      if(byString[i])
        list.push({
          p: byString[i].fret + tuning[i],
          finger: byString[i].fingerNumber == null ? -1 : byString[i].fingerNumber,
          string: i
        })
    }

    return list.sort((A, B) => B.p - A.p)
  }
}
module.exports = HandPosition
