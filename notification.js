const { Notification } = require('electron');

function showNotification(options) {
    const n = new Notification({
        title: "CodeReady Containers",
        body: options.body
    })
    if (options.onClick) {
        n.on('click',  options.onClick)
    }
    n.show()
}

module.exports = showNotification