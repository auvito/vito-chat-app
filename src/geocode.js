const request = require('request')

const geocode = (latitude, longitude, callback) => {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+ encodeURIComponent(latitude) + ',' + encodeURIComponent(longitude) + '.json?access_token=pk.eyJ1IjoiYXVyZWxpdXN2aXRvIiwiYSI6ImNrZmlsM2JpdzBkMWkycm8wNmdjN2pqNGkifQ.keuxeH6DKUEeaD0j672S6w'
    request({url:url, json:true}, (error, {body}) => {
        if(error){
            callback('Unable to connect to location services', undefined)
        }else if(body.features.length === 0){
            callback('Unable to find location', undefined)
        }else{
            callback(undefined, {
                location: body.features[0].place_name
            })
        }
    })
}

module.exports = geocode