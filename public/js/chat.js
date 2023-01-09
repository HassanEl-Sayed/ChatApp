const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $locationFormButton=document.querySelector('#send-mylocation')
const $messsage = document.querySelector('#message')

//templete
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplete = document.querySelector('#location-message-template').innerHTML
const sidebarTamplete = document.querySelector('#sidebar-template').innerHTML
//option
const {username , room} = Qs.parse(location.search ,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    //new Message element
    const $newMessage = $messsage.lastElementChild
    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visable height
    const visableHeight = $messsage.offsetHeight
    
    //Height of messages container
    const containerHeight = $messsage.scrollHeight

    //How far have I scorlled?
    const scrolloffset = $messsage.scrollTop + visableHeight

    if(containerHeight - newMessageHeight <= scrolloffset){
        $messsage.scrollTop = $messsage.scrollHeight
    }

}

socket.on('message' , (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messsage.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//sent location
socket.on('locationMessage' , (message)=> {
    console.log(message)
    const html = Mustache.render(locationMessageTemplete,{
        username: message.username,
        url : message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messsage.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.on('roomData' ,({room,users})=>{
  const html = Mustache.render(sidebarTamplete,{
      room,
      users
  })
  document.querySelector('#sidebar').innerHTML = html
})

//for sent message
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled' , 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage' , message ,(error)=>{
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()

        if (error){
            return console.log(error)
        }
        console.log('message deliverd')
    })
})

//for location
$locationFormButton.addEventListener('click',()=>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

   $locationFormButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationFormButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })    
})

socket.emit('join', {username , room} , (error)=>{
    if (error) {
        alert(error)
        location.href= '/'
    }
})

