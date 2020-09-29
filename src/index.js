const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const {getUser, removeUser, getUsersInRoom, addUser} = require('./utils/users')
// const geocode = require('./geocode')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New connection!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('msgToClient', generateMessage('Welcome!~'), 'Server')
        socket.broadcast.to(user.room).emit('msgToClient', generateMessage(`${user.username} has joined.`), 'Server')
        io.to(user.room).emit('populateRoom', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMsg', (msg ,callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        if(!msg){
            return callback('Provide a message!')
        }

        io.to(user.room).emit('msgToClient', generateMessage(msg), user.username)
        callback('Delivered')
    })

    socket.on('disconnect', () => {
        const gettingUser = getUser(socket.id)
        const user = removeUser(socket.id)
        if(user){
            io.to(gettingUser.room).emit('msgToClient', generateMessage(`${gettingUser.username} has left the room`), 'Server')
            io.to(gettingUser.room).emit('populateRoom', {
                room: gettingUser.room,
                users: getUsersInRoom(gettingUser.room)
            })
        }
    })

    socket.on('locationMsg', (msg, callback) => {
        // geocode(msg.latitude, msg.longitude, (locationName) => {
        //         const locationNameFinal = locationName
        // })
        // if(!locationNameFinal){
        //     io.emit('serverMsg', 'A new user has joined from '+msg.latitude+msg.longitude+'.')
        // }

        // io.emit('serverMsg', 'A new user has joined from '+locationNameFinal+'.')
        
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port '+port)
})