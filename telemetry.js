const Analytics = require('analytics-node');
const { app } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const {v4: uuidv4 } = require('uuid');
const hash = require('object-hash');

let writeKey = 'R7jGNYYO5gH0Nl5gDlMEuZ3gPlDJKQak'; // test
let userIdHashPath = path.join(__dirname, "segmentIdentityHash");
let userIdPath = path.join(os.homedir(), '.redhat', 'anonymousId');

module.exports = class Telemetry {
    #traits = {
        tray_os_version: os.version(), // Windows 10 Pro
        tray_os_release: os.release(), // 10.0.19043
        tray_os: os.platform(), // win32
    }
    
    #context = {
        ip: "0.0.0.0"
    }

    constructor(telemetryEnabled) {
        this.telemetryEnabled = telemetryEnabled
        
        if (!telemetryEnabled) {
            return
        }

        this.analytics = new Analytics(writeKey, { flushAt: 1 });
        
        // get user identity UUID and cache it in userID
        this.userId = getUserId()
        
        let identity = {
            userId: this.userId, 
            traits: this.#traits
        }

        // get the hash of the user identity
        this.userIdHash = getUserIdHash()
        
        const idHash = hash.sha1(identity)
        if (idHash !== this.userIdHash) {
            // update userIdHash
            this.userIdHash = idHash
            writeUserIdHash(idHash)
            
            // send identify event to segment
            this.analytics.identify({
                userId: this.userId,
                traits: this.#traits,
                context: this.#context
            })
        }
    }

    trackError(errorMsg) {
        if (!this.telemetryEnabled) {
            return
        }

        let properties = genProperties(errorMsg)

        this.analytics.track({
            userId: this.userId,
            event: 'tray error occured',
            context: this.#context,
            properties: properties
        })
    }

    trackSuccess(successMsg) {
        if (!this.telemetryEnabled) {
            return
        }

        let properties = genProperties(successMsg)

        this.analytics.track({
            userId: this.userId,
            event: 'tray operation successful',
            context: this.#context,
            properties: properties
        })
    }
}

// fetch userID from ~/.redhat/anonymousID if exists
// or else generate, write to disk and return the it
function getUserId() {
    try {
        let data = fs.readFileSync(userIdPath)
        return data.toString()
    } catch (err) {
        console.log(err)
        let uuid = writeNewUuid()
        return uuid
    }
}
 
function writeNewUuid() {
    let dir = path.join(app.getPath('home'), '.redhat')
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let uuid = uuidv4()
    try {
        fs.writeFileSync(userIdPath, uuid)
        return uuid
    } catch (err) {
        console.log(err)
        return
    }
}

function writeUserIdHash(userIdHash) {
    try {
        fs.writeFileSync(userIdHashPath, userIdHash)
        console.log(`wrote new identity hash to: ${userIdHashPath}`)
    } catch (err) {
        console.log(err)
        return
    }
}
 
function getUserIdHash() {
    try {
        let data = fs.readFileSync(userIdHashPath)
        return data.toString()
    } catch (err) {
        console.log(err)
        return ""
    }
}

function genProperties(message) {
    const properties = {
        source: "tray-electron",
        tray_version: app.getVersion(),
        crc_version: "",
        message: message
    }
    return properties
}
