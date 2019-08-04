const OneSignal = require('onesignal-node');   
client = new OneSignal.Client({      
    userAuthKey: process.env.ONE_SIGNAL_AUTH_KEY,      
    // note that "app" must have "appAuthKey" and "appId" keys      
    app: { appAuthKey: process.env.ONE_SIGNAL_AUTH_KEY, appId: process.env.ONE_SIGNAL_APP_ID }      
});   

exports.newNotification = (contents, player_id) => {
    return new Promise(async (resolve, reject) => {
        const notification = new OneSignal.Notification({
            contents,
            include_player_ids: player_id,
        })
        console.log(notification)
        // try {
        const data = client.sendNotification(notification, (err, httpResponse, data) => {
            if (err) console.log('HUBO UN ERROR')
            if (httpResponse) console.log('TODO OK')
            if (data) console.log(data)

        })
            resolve(200)
        // } catch (err) {
        //     console.log(err)
        //     reject(500)
        // }
    })
}