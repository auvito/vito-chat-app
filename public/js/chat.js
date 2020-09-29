const socket = io()

const $messages = document.querySelector('#listMsg')
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('serverMsg', (serverMsg) => {
    console.log(serverMsg)
})

socket.on('msgToClient', (msg, username) => {
    const html = Mustache.render(messageTemplate, {
        username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('populateRoom', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector('.chatForm').addEventListener('submit', (e) => {
    e.preventDefault()

    const msgText = document.querySelector("#msgText").value
    socket.emit('sendMsg', msgText, (error) => {
        document.querySelector("#msgText").value = ''

        if(error !== 'Delivered'){
            return alert(error)
        }
    })
})

socket.emit('join', {username, room}, (error) => {

})
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Click')
//     socket.emit('inc')
// })