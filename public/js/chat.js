const socket =io()
const $sendLocation =document.querySelector('#location')
const $messageButton = document.querySelector('#messageButton')
const form = document.querySelector('form')
const message = document.querySelector('#message')
const messageDiv = document.querySelector('#messages')
const sidebarDiv = document.querySelector('#chat__sidebar')


//templates
const messageTemp =document.querySelector('#message-template').innerHTML


//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})
const autoscroll = ()=>{
//New message element
const newMessage = messageDiv.lastElementChild
//height of new element
const newMessageStyles = getComputedStyle(newMessage)
const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeight = newMessage.offsetHeight +newMessageMargin
//visible height
const visibleHeight =messageDiv.offsetHeight
//height of message container
const containerHeight= messageDiv.scrollHeight
// How far have I scrolled
const scrollOffset =messageDiv.scrollTop + visibleHeight

if(containerHeight - newMessageHeight <= scrollOffset){
messageDiv.scrollTop = messageDiv.scrollHeight
}

}
socket.on('message', (message)=>{


const markup = `<div class ="message">
 <p>
 <span class="message__name" >${message.username}</span>
 <span class="message__meta" >${moment(message.createdAt).format('h:mm a')}</span>
 </p>
 <p> ${message.text}</p>
  </div>`;
messageDiv.insertAdjacentHTML('beforeend', markup)
autoscroll()
})

socket.on('locationMessage', (location)=>{
  
    
 //moment replace
const markup = `<div>
 <p>
 <span class="message__name" >${location.username}</span>
 <span class="message__meta" >${moment(location.createdAt).format('h:mm a')}</span>
 </p>
 <a target="_blank" href="${location.url}">My location</a>
 </div>`;
messageDiv.insertAdjacentHTML('beforeend', markup)
autoscroll()
})
socket.on('roomData', (data)=>{
    sidebarDiv.innerHTML=''
    let users=''
    const usersArr = data.users.map(userObj => userObj.username )
    usersArr.forEach(user=>users += `<li>${user}</li>`)
    let markup = `<div>
    <h2 class="room__title" >${data.room}</h2>
    <h3 class= "list-title" >Users</h3>
    <ul class="users">${users}</ul>
    </div>`
  
    
    sidebarDiv.insertAdjacentHTML('beforeend', markup)
    console.log(data)
})

form.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageButton.setAttribute('disabled', 'disabled')
    socket.emit('userMessage', message.value,(error)=>{
        $messageButton.removeAttribute('disabled')
        if(error){
            return console.log(error)
        }

        console.log('Message delivered.')})
    message.value=''
    message.focus()
})

$sendLocation.addEventListener('click', ()=>{
    if(!navigator.geolocation){
return alert('Geolocation is not supported by your browser.')
    }
$sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const myPosition ={
            latitude:position.coords.latitude,longitude:position.coords.longitude
        }
        socket.emit('sendLocation', myPosition, (message)=>{
            $sendLocation.removeAttribute('disabled')
          if(!message){
           return   console.log('Unable to send location!')
          }
            console.log(message)
        })


    })
})

socket.emit('join', {username, room}, (error)=>{
   
    if(error){
        alert(error)
        location.href='/'
    }
    console.log('message sent')
})