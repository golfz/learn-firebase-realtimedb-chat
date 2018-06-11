let cookieUser = "userName"
let cookiePic = "userPic"

//let userName = ""
//let userPic = ""

let chatRef = firebase.database().ref('GolFz-chat-history');
let chatChild = chatRef.child('chat')

let onlineChild = chatRef.child('online')

//chatRef.remove()
//chatChild.remove()
//onlineChild.remove()

/*-------------------
  Firebase Events
--------------------*/

chatChild.on('child_added', function (childSnapshot, prevChildKey) {
  appendNewChat(childSnapshot.val())
});

onlineChild.on('value', function (dataSnapshot) {
  $('#online-user-wrapper').html('')
  console.log(dataSnapshot.val()['online'])
  for (item in dataSnapshot.val()['online']) {
    appendNewOnline(dataSnapshot.val()['online'][item])
  }

});

/*-------------------
  Interaction Events
--------------------*/

$("#inputMsg").on("keydown", function (event) {
  if (event.which == 13) {
    pushNewMessage()
  }
});

$('#btnSend').click(function () {
  pushNewMessage()

  console.log('adsfasdf')
})

$('#btnChangeUser').click(function () {
  changeUser()
})

/*-------------------
  Control flow
--------------------*/

console.log(getCookie(cookieUser))
if (getCookie(cookieUser) == "") {
  console.log('no login')
  changeUser()
} else {
  console.log('already login')
  alreadyLogin()
}

/*-----------------------------------------------------------
  Function
-----------------------------------------------------------*/

function appendNewChat(chatObj) {
  let itemUserName = chatObj['user_name']
  let itemUserPic = chatObj['user_pic']
  let itemText = chatObj['text']
  let itemTimestamp = chatObj['timestamp']

  let chatItemDiv = `
            <div class="chat-history-item">
              <div class="chat-person">
                <img src="${itemUserPic}" class="rounded-circle d-inline-block mw-100 mh-100">
              </div>
              <div class="chat-message">
                <div class="chat-message-user"><b>${itemUserName}</b> | <i>${itemTimestamp}</i></div>
                <p>
                  <span>${itemText}</span>
                </p>
                <hr>
              </div>
            </div>`

  $('#chat-history-wrapper').append(chatItemDiv)

  scrollChat(50)
}

function changeUser() {

  removeCurrentUserFromOnlineList()

  $.ajax({
    url: 'https://randomuser.me/api/',
    dataType: 'json',
    success: function (data) {
      console.log(data);
      let firstname = jsUcfirst(data.results[0]['name']['first'])
      let lastname = jsUcfirst(data.results[0]['name']['last'])
      userPic = data.results[0]['picture']['large']

      userName = `${firstname} ${lastname}`

      setCookie(cookieUser, userName, 30)
      setCookie(cookiePic, userPic, 30)

      alreadyLogin()
    }
  })
}

function setCurrentUser() {
  $('#chat-box-pic-wrap > img').attr('src', getCookie(cookiePic))
  $('#chat-box-text > p > b').text(getCookie(cookieUser))
}


function pushNewMessage() {
  let msg = $('#inputMsg').val()
  $('#inputMsg').val('')
  var d = new Date()
  let thisTime = strftime('%e %B %Y at %l:%M:%S%P', d)

  var newMessageRef = firebase.database().ref('GolFz-chat-history').child('chat').push()
  newMessageRef.set({
    'user_name': getCookie(cookieUser),
    'user_pic': getCookie(cookiePic),
    'text': msg,
    'timestamp': thisTime
  })
}

function appendNewOnline(onlineObj) {

  console.log(onlineObj)

  let itemUserName = onlineObj['user_name']
  let itemUserPic = onlineObj['user_pic']
  let itemTimestamp = onlineObj['active_time']

  itemTimestamp = strftime('%a %X', itemTimestamp)

  let onlineItemDiv = `
            <div class="online-user-item">
              <div class="online-user-pic-wrap">
                <img src="${itemUserPic}" class="rounded-circle d-inline-block mw-100 mh-100">
              </div>
              <div class="online-user-info">
                <p><b>${itemUserName}</b> | User</p>
                <div><i>Active from ${itemTimestamp}</i></div>
              </div>
            </div>`

  $('#online-user-wrapper').append(onlineItemDiv)
}

function alreadyLogin() {
  setCurrentUser()
  updateOnlineUser()
}

function updateOnlineUser() {

  onlineChild.once("value")
    .then(function (snapshot) {

      let currentOnline

      let aSnapshot = snapshot.val()

      if (aSnapshot == null) {
        onlineChild.update({
          online: [{
            user_name: getCookie(cookieUser),
            user_pic: getCookie(cookiePic),
            active_time: Date.now()
          }]
        })

        currentOnline = [{
          user_name: getCookie(cookieUser),
          user_pic: getCookie(cookiePic),
          active_time: Date.now()
        }]

      } else {
        currentOnline = snapshot.val()['online'];
        console.log(currentOnline)
      }

      let temp = currentOnline.filter(x => x.user_name != getCookie(cookieUser))

      if (temp.length != currentOnline.length) { // current user is already in online list
        return;

      } else {

        temp.push({
          user_name: getCookie(cookieUser),
          user_pic: getCookie(cookiePic),
          active_time: Date.now()
        })

        currentOnline = temp

      }

      console.log(currentOnline)

      onlineChild.update({
        online: currentOnline
      })

    });
}

function removeCurrentUserFromOnlineList() {
  onlineChild.once("value")
    .then(function (snapshot) {

      let currentOnline

      let aSnapshot = snapshot.val()

      currentOnline = snapshot.val()['online'];

      let temp = currentOnline.filter(x => x.user_name != getCookie(cookieUser))
      currentOnline = temp

      onlineChild.update({
        online: currentOnline
      })

    });
}
