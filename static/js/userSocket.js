module.exports = function (userId){
        return `
            var socket = io()
            /* 접속 되었을 때 실행 */
            socket.on('connect', function() {
                /* 이름을 입력받고 */
                var name = "${userId}";
                /* 서버에 새로운 유저가 왔다고 알림 */
                socket.emit('newUser', {name:name})
            })
            socket.on('chatHistory', function(data) {
                var chat = document.getElementById('chat')
    
                i = 0;
                while(i < data.chatHistory.length){
                    if((i > 0 && compareDate(data.chatHistory[i].dateTime,data.chatHistory[i-1].dateTime) == 1)){
                        var date = document.createElement('div')
                        var node = document.createTextNode(data.chatHistory[i].dateTime.substring(0,10))
                        console.log(data.chatHistory[i].dateTime.substring(0,10))
                        date.classList.add('dateNotice')

                        date.appendChild(node)
                        chat.appendChild(date)
                    }
                    var msg = document.createElement('div')
                    var node = document.createTextNode(data.chatHistory[i].name)
                    var timeNode = document.createTextNode(data.chatHistory[i].time)
                    var time = document.createElement('div')
                    var node;
                    
                    if (data.chatHistory[i].name == '${userId}'){
                        var readMsg = document.createElement('div')
                        var readMsgNode = document.createTextNode("읽음")
                        readMsg.classList.add('readMsg')
                        if(data.chatHistory[i].isRead == 0){
                            readMsg.style.visibility = 'hidden';    
                        }
                        node = document.createTextNode(data.chatHistory[i].message)
                        msg.classList.add('me')
                        time.classList.add('myTime')
                        msg.appendChild(node)
                        time.append(timeNode)
                        readMsg.append(readMsgNode)
                        chat.appendChild(msg)
                        chat.appendChild(time)
                        chat.appendChild(readMsg)
                    }else{
                        node = document.createTextNode(data.chatHistory[i].name+" : "+data.chatHistory[i].message)
                        msg.classList.add('other')
                        time.classList.add('otherTime')
                        msg.appendChild(node)
                        time.append(timeNode)
                        chat.appendChild(msg)
                        chat.appendChild(time)
                    }
                    i = i + 1;
                }
                chat.scrollTop = chat.scrollHeight;         
            })
            /* 서버로부터 데이터 받은 경우 */
            socket.on('update', function(data) {
                var chat = document.getElementById('chat')

                var message = document.createElement('div')
                var node = document.createTextNode(data.name+" : "+data.message)
                var timeNode = document.createTextNode(get_time())
                var time = document.createElement('div')
                var className = ''

                // 타입에 따라 적용할 클래스를 다르게 지정
                switch(data.type) {
                    case 'message':
                        className = 'other'
                        break

                    case 'connect':
                        className = 'connect'
                        break

                    case 'disconnect':
                        className = 'disconnect'
                        break
                }

                message.classList.add(className)
                time.classList.add('otherTime')
                message.appendChild(node)
                time.append(timeNode)
                chat.appendChild(message)
                chat.appendChild(time)
                chat.scrollTop = chat.scrollHeight;         
            })
            
            socket.on('setMsg', function(data) {
                // 입력되어있는 데이터 가져오
                var message = data.message;

                // 채팅창에 메세지 표시
                var chat = document.getElementById('chat')
                var msg = document.createElement('div')
                var node = document.createTextNode(message)
                var timeNode = document.createTextNode(get_time())
                var div = document.createElement('div')
                var time = document.createElement('div')
                var readMsg = document.createElement('div')
                var readMsgNode = document.createTextNode("읽음")
                msg.classList.add('me')
                time.classList.add('myTime')
                readMsg.classList.add('readMsg')
                if(data.readMsg == 0){
                    readMsg.style.visibility = 'hidden';    
                }
                msg.appendChild(node)
                div.append(msg)
                time.append(timeNode)
                readMsg.append(readMsgNode)
                chat.appendChild(div)
                chat.appendChild(time)
                chat.appendChild(readMsg)
                chat.scrollTop = chat.scrollHeight;         

            })
            
            socket.on('setReadMsgClient', function(data) {
                var readMsg = document.getElementsByClassName('readMsg');
                for(i = 0; i < readMsg.length; i++) {
                    readMsg[i].style.setProperty("visibility","visible")
                }
            })

            /* 메시지 전송 함수 */
            function send() {
                // 입력되어있는 데이터 가져오기
                var message = document.getElementById('chatInput').value

                // 가져왔으니 데이터 빈칸으로 변경
                document.getElementById('chatInput').value = ''

                // 서버로 message 이벤트 전달 + 데이터와 함께
                socket.emit('message', {type: 'message', message: message, time: get_time()})
            }

            function get_time() {
                var now = new Date();
                var hour = now.getHours();
                var minute = now.getMinutes();
                var second = now.getSeconds();
                var str_ampm, dsp_ampm;
                if(hour ==0){
                    str_ampm = "오전" // 이거 -> 오후
                }else if(hour <12){ // 이거 -> 13
                    str_ampm = "오전"
                }else {
                    hour -=12;
                    str_ampm = "오후"
                }
                hour = (hour ==0)? 12:hour;

                if(minute <10)
                    minute = "0" + minute;
                if (second < 10)
                    second = "0" + second;

                dsp_ampm = str_ampm+" "+hour+" : "+minute
                return dsp_ampm;
            }
            
            function compareDate(date1,date2){
                var result;
                var year_1 = date1.substring(0,4);
                var month_1 = date1.substring(5,7);
                var date_1 = date1.substring(8,10);
            
                var year_2 = date2.substring(0,4);
                var month_2 = date2.substring(5,7);
                var date_2 = date2.substring(8,10);
            
                var fullDate1 = (year_1*1000) + (month_1*100) + date_1*1;
                var fullDate2 = (year_2*1000) + (month_2*100) + date_2*1;
            
                if (fullDate1 - fullDate2 > 0){
                    result = 1;
                }else{
                    result = 0;
                }
                return result;
            }
            `

}

//     var userId = "";
//     var socket = io()
//     /* 접속 되었을 때 실행 */
//     socket.on('connect', function() {
//         /* 이름을 입력받고 */
//         var name = "${userId}";
//         /* 서버에 새로운 유저가 왔다고 알림 */
//         socket.emit('newUser', {name:name})
//     })
//
// socket.on('chatHistory', function(data) {
//     var chat = document.getElementById('chat')
//
//     i = 0;
//     while(i < data.chatHistory.length){
//         var msg = document.createElement('div')
//         var node = document.createTextNode(data.chatHistory[i].name)
//         var timeNode = document.createTextNode(data.chatHistory[i].time)
//         var time = document.createElement('div')
//         var node;
//         if (data.chatHistory[i].name == '${userId}'){
//             node = document.createTextNode(data.chatHistory[i].message)
//             msg.classList.add('me')
//             time.classList.add('myTime')
//         }else{
//             node = document.createTextNode(data.chatHistory[i].name+" : "+data.chatHistory[i].message)
//             msg.classList.add('other')
//             time.classList.add('otherTime')
//         }
//
//         msg.appendChild(node)
//         time.append(timeNode)
//         chat.appendChild(msg)
//         chat.appendChild(time)
//         i = i + 1;
//     }
// })
//
//     /* 서버로부터 데이터 받은 경우 */
//
//     socket.on('update', function(data) {
//         var chat = document.getElementById('chat')
//
//         var message = document.createElement('div')
//         var node = document.createTextNode(data.name+" : "+data.message)
//         var timeNode = document.createTextNode(get_time())
//         var time = document.createElement('div')
//         var className = ''
//
//         // 타입에 따라 적용할 클래스를 다르게 지정
//         switch(data.type) {
//             case 'message':
//                 className = 'other'
//                 break
//
//             case 'connect':
//                 className = 'connect'
//                 break
//
//             case 'disconnect':
//                 className = 'disconnect'
//                 break
//         }
//
//         message.classList.add(className)
//         time.classList.add('otherTime')
//         message.appendChild(node)
//         time.append(timeNode)
//         chat.appendChild(message)
//         chat.appendChild(time)
//     })
//
//     /* 메시지 전송 함수 */
//     function send() {
//         const listeners = socket.listenersAny();
//         console.log(listeners[0],"할루할루")
//         // 입력되어있는 데이터 가져오기
//         var message = document.getElementById('chatInput').value
//
//         // 가져왔으니 데이터 빈칸으로 변경
//         document.getElementById('chatInput').value = ''
//
//         // 내가 전송할 메시지 클라이언트에게 표
//         var chat = document.getElementById('chat')
//         var msg = document.createElement('div')
//         var node = document.createTextNode(message)
//         var timeNode = document.createTextNode(get_time())
//         var div = document.createElement('div')
//         var time = document.createElement('div')
//         msg.classList.add('me')
//         time.classList.add('myTime')
//         msg.appendChild(node)
//         div.append(msg)
//         time.append(timeNode)
//         chat.appendChild(div)
//         chat.appendChild(time)
//
//         // 서버로 message 이벤트 전달 + 데이터와 함께
//         socket.emit('message', {type: 'message', message: message, time: get_time()})
//     }
//
//     function get_time() {
//         var now = new Date();
//         var hour = now.getHours();
//         var minute = now.getMinutes();
//         var second = now.getSeconds();
//         var str_ampm, dsp_ampm;
//         if(hour ==0){
//             str_ampm = "오전" // 이거 -> 오후
//         }else if(hour <12){ // 이거 -> 13
//             str_ampm = "오전"
//         }else {
//             hour -=12;
//             str_ampm = "오후"
//         }
//         hour = (hour ==0)? 12:hour;
//
//         if(hour < 10)
//             hour = "0" + hour;
//         if(minute <10)
//             minute = "0" + minute;
//         if (second < 10)
//             second = "0" + second;
//
//         dsp_ampm = str_ampm+" "+hour+" : "+minute
//         return dsp_ampm;
//     }
//
//
