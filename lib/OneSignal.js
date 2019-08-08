const OneSignal = require('onesignal-node');  
client = new OneSignal.Client({      
    userAuthKey: process.env.ONE_SIGNAL_AUTH_KEY,      
    // note that "app" must have "appAuthKey" and "appId" keys      
    app: { appAuthKey: process.env.ONE_SIGNAL_AUTH_KEY, appId: process.env.ONE_SIGNAL_APP_ID }      
});   

exports.newNotification = (notificationObject) => {
    const notification = new OneSignal.Notification({
        contents: notificationObject.contents,
        data: notificationObject.data,
        include_player_ids: notificationObject.player_ids,
    })
    return new Promise(async (resolve, reject) => {
        try {
            const data = await client.sendNotification(notification)
            resolve(200)
        } catch (err) {
            console.log(err)
            reject(500)
        }
    })
}

exports.OneSignal