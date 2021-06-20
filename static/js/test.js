var socket = io()
/* 접속 되었을 때 실행 */
socket.on('connect', function() {
    socket.emit('adminConnect',{name:'admin123'})
})

socket.on('loadRoom', function (data){
    console.log("로드룸 됏음")
    var $chatRoomContainer = $(`#chatRoomContainer`);
    $chatRoomContainer.empty();
    var i = 0;
    while (i < data.chatList.length){
        var $chatRoom = $(`<form class="chatRoom" id="chatRoom${data.chatList[i].room}"
                        onmouseover="mover('${data.chatList[i].room}')" onmouseout="mout('${data.chatList[i].room}')"
                            onclick="joinRoom('${data.chatList[i].room}');
                                    document.getElementById('chatRoom${data.chatList[i].room}').submit()">
                          </form>`)
        var $roomId = $(`<input type="hidden" name="roomId" value="${data.chatList[i].room}">`)
        var $userId = $(`<div class="userId">" ${data.chatList[i].room} " 고객님</div>`)
        var $time = $(`<div class="time">${getDateOrTime(data.chatList[i].dateTime,data.chatList[i].time)}</div>`)
        console.log("akakakak",getDateOrTime(data.chatList[i].time,data.chatList[i].dateTime))
        console.log(data.chatList[i].dateTime)
        var $msgContainer = $(`<div class="msgContainer"></div>`)
        var $msg = $(`<div class="msg" style="flex-basis: 94%">${data.chatList[i].lastMsg}</div>`)
        var $noReadMsgNum = $(`<div class="noReadMsgNum">${data.chatList[i].noReadMsgNum}</div>`)
        $msgContainer.append($msg)
        if (data.chatList[i].noReadMsgNum > 0){
            $msgContainer.append($noReadMsgNum)
        }
        $chatRoom.append($roomId)
        $chatRoom.append($userId)
        $chatRoom.append($time)
        $chatRoom.append($msgContainer)
        $chatRoomContainer.append($chatRoom)
        i = i + 1;
    }

})

socket.on('deleteRoom', function (data){
    var $row = $(`#joinForm${data.roomId}`)
    var $time = $(`#time${data.roomId}`)
    $row.remove();
    $time.remove();
})

function joinRoom(name){
    window.open('',`${name}`,'width=430,height=500,location=no,status=no,toolbar=no,scrollbars=no');
    document.getElementById(`chatRoom`+name).action = 'http://192.168.35.17:7777/'
    document.getElementById(`chatRoom`+name).method = 'post'
    document.getElementById(`chatRoom`+name).target = `${name}`
}

function mover(name){
    document.getElementById(`chatRoom`+name).style.background = "rgb(236,236,237)"
}
function mout(name){
    document.getElementById(`chatRoom`+ name).style.background = "#ffffff"
}

//오늘, 어제, 어제보다 전 구분해서 리턴하는 함수
function getDateOrTime(dateFromDb,timeFromDb){
    var result;
    var now = new Date();
    var nowYear = now.getFullYear()
    var nowMonth = now.getMonth() + 1;
    var nowDate = now.getDate()

    var year = dateFromDb.substring(0,4);
    var month = dateFromDb.substring(5,7);
    var date = dateFromDb.substring(8,10);

    var nowDate2 = (nowYear*1000) + (nowMonth*100) + nowDate;
    var dateInDb = (year*1000) + (month*100) + date*1;

    if (nowDate2 - dateInDb == 0){
        result = timeFromDb
    }else if(nowDate2 - dateInDb == 1){
        result = '어제'
    }else{
        result = dateFromDb.substring(0,10)
    }
    return result;
}