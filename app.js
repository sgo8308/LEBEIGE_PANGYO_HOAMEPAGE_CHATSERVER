const express = require('express')
const socket = require('socket.io')
const http = require('http')

const adminSocket = require('./static/js/adminSocket')
const userSocket = require('./static/js/userSocket')

const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')

/* express http 서버 생성 */
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server)

connection.connect();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/test',function (request,response){
    response.sendFile(__dirname + '/static/js/test.html');
})

app.post('/', function(request, response) {
    request.session.userId = request.body.userId;
    if (request.body.userId){
        if (request.body.userId == 'admin123'){
            response.sendFile(__dirname + '/static/js/test.html');
        }else{
            response.send(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>채팅</title>
                    <link rel="stylesheet" href="/css/forAll.css">
                    <link rel="stylesheet" href="/css/index.css">
                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
                    <script src="/socket.io/socket.io.js"></script>
                    <script>
                        ${userSocket(request.body.userId)}
                    </script>
                </head>
                <body style="overflow-X: hidden">
                <div id="main">
                    <div id="titleBar">르베이지 판교점</div>
                    <div style="font-size: 12px;">* 채팅문의 가능시간 10:00 ~ 20:00</div>
                    <div id="chat">
                        <!-- 채팅 메시지 영역 -->
                    </div>
                    <div>
                        <input type="text" id="chatInput" placeholder="메시지를 입력해주세요..">
                        <button onclick="send()">전송</button>
                    </div>
                </div>
                </body>
                </html>
            `
            )
        }
    }else{
        if (request.body.roomId){
            response.send(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>채팅</title>
                    <link rel="stylesheet" href="/css/forAll.css">
                    <link rel="stylesheet" href="/css/index.css">
                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
                    <script src="/socket.io/socket.io.js"></script>
                    <script>
                         ${adminSocket(request.body.roomId)}
                    </script>
                </head>
                <body style="overflow-X: hidden">
                <div id="main">
                    <div id="titleBar">${request.body.roomId} 고객님</div>
                    <div id="chat">
                        <!-- 채팅 메시지 영역 -->
                    </div>
                    <div>
                        <input type="text" id="chatInput" placeholder="메시지를 입력해주세요..">
                        <button onclick="send()">전송</button>
                    </div>
                </div>
                </body>
                </html>
            `
            )
        }
    }
})

var roomBox = []; //채팅 목록 표시하기 위해서
var roomList = {}; // 방 안에 있는 사람 수 계산하기 위해서
io.sockets.on('connection', function(socket) {
    //관리자 부분 이벤트 리스너
    //관리자가 채팅 목록 켰을 때
    socket.on('adminConnect', function (data){
        var query = `SELECT * FROM ChatList ORDER BY dateTime DESC`
        connection.query(query, function (error, results){
            logError("채팅목록 셀렉트 에러 : ", error);
            io.sockets.emit('loadRoom', {chatList: results})
            console.log(results)
        })
    })
    //관리자가 채팅방 들어갈 때
    socket.on('joinRoom', function (data){
        socket.room = data.roomId;
        socket.name = "관리자";
        socket.join(data.roomId);
        if(roomList[`${data.roomId}`]){
            roomList[`${data.roomId}`].push(socket.name)
        }else{
            roomList[`${data.roomId}`] = [socket.name];
        }
        console.log('현재 방에 있는 사람들은? =>',roomList[`${data.roomId}`])
        //고객 메세지 읽음 처리 해주기
        var query = `UPDATE Chat SET isRead = 1 WHERE room = '${socket.room}' and name = '${socket.room}' and isRead = 0;`
        console.log(query)
        connection.query(query, function (error, results){
            logError("고객 메세지 읽음 처리 에러 : ", error);
        })
        socket.broadcast.to(socket.room).emit('setReadMsgClient', '');


        //채팅리스트 테이블 안 읽은 갯수 0으로 바꿔준 후 다시 loadroom 해주기
        var query2 = `UPDATE ChatList SET noReadMsgNum = 0 WHERE room = '${socket.room}';`
        connection.query(query2, function (error, results){
            logError("고객 메세지 읽음 처리 에러 : ", error);
            var query3 = `SELECT * FROM ChatList ORDER BY dateTime DESC`
            connection.query(query3, function (error2, results2){
                logError("채팅목록 셀렉트 에러 : ", error2);
                io.sockets.emit('loadRoom', {chatList: results2})
            })
        })

        //채팅 내역 클라이언트로 전송
        var query = `SELECT * FROM Chat WHERE room = '${socket.room}' ORDER BY dateTime`
        connection.query(query, function (error, results){
            logError("디비에서 채팅내역 가져오기 에러 : ",error)
            socket.emit('chatHistory', {chatHistory: results})
            console.log("조인룸쪽 챗히스토리다")
        })
    })

    //고객 부분 이벤트 리스너
    socket.on('newUser', function(data) {
        /* 소켓에 이름 저장해두기 */
        socket.name = data.name
        socket.room = data.name;
        socket.join(socket.room);
        roomBox.push(socket.room);
        console.log(roomBox)
        if(roomList[`${socket.room}`]){
            roomList[`${socket.room}`].push(socket.name)
        }else{
            roomList[`${socket.room}`] = [socket.name];
        }
        console.log('현재 방에 있는 사람들은? =>',roomList[`${socket.room}`])

        /* 채팅내역 클라이언트로 전송 */
        var query = `SELECT * FROM Chat WHERE room = '${socket.room}' ORDER BY dateTime`
        connection.query(query, function (error, results){
            logError("디비에서 채팅내역 가져오기 에러 : ",error)
            socket.emit('chatHistory', {chatHistory: results})
            console.log("누유저쪽 챗히스토리다")

        })

        // 관리자가 보낸 메세지들 읽음처리 해주기
        var query2 = `UPDATE Chat SET isRead = 1 WHERE room = '${socket.room}' and name = '관리자' and isRead = 0`
        connection.query(query2, function (error, results){
            logError("관리자 메세지 읽음 처리 에러 : ",error)
        })
        socket.broadcast.to(socket.room).emit('setReadMsgAdmin', '');

    })

    /* 전송한 메시지 받기 */
    socket.on('message', function(data) {
        /* 받은 데이터에 누가 보냈는지 이름을 추가 */
        data.name = socket.name

        console.log("메세지 데이터",data)

        /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
        socket.broadcast.to(socket.room).emit('update', data);
        //채팅 읽음 처리 로직 - 채팅 테이블 부분
        var readMsg;
        if(roomList[`${socket.room}`].length == 2){
            var query = `INSERT into Chat (name, message, dateTime, room, isRead, time) 
                         VALUES ('${socket.name}','${data.message}',NOW(),'${socket.room}', 1, '${data.time}')`
            readMsg = 1;
        }else{
            var query = `INSERT into Chat (name, message, dateTime, room, isRead, time) 
                         VALUES ('${socket.name}','${data.message}',NOW(),'${socket.room}', 0, '${data.time}')`
            readMsg = 0;
        }
        connection.query(query, function (error, results){
            logError("채팅 읽음 처리 방에 2명 있을 때 인서트 에러 : ",error)
            //클라이언트에서 메세지창에 메세지 세팅하도록 이벤트 보내주기
            socket.emit("setMsg",{message: data.message, readMsg: readMsg, msgId: results.insertId})
        })

        //안 읽은 채팅 갯수 알아내기
        var query2 = `SELECT * FROM Chat WHERE room = '${socket.room}' and isRead = '0' and name = '${socket.room}'`
        var noReadMsgNum ;
        connection.query(query2, function (error, results){
            noReadMsgNum = results.length;
        })
        //채팅리스트 테이블에 데이터 집어 넣기
        var query3 = `SELECT * FROM ChatList WHERE room = '${socket.room}'`
        connection.query(query3, function (error2, results2){
            var query4 = ``;
            if (results2[0]){
                query4 = `UPDATE ChatList SET lastMsg = '${data.message}',dateTime = NOW(), time = '${data.time}', noReadMsgNum = '${noReadMsgNum}', name = '${socket.name}'
                                    WHERE room = '${socket.room}'`
            }else{
                query4 = `INSERT into ChatList (room, lastMsg, time, dateTime, noReadMsgNum, name) 
                                  VALUES ('${socket.room}', '${data.message}', '${data.time}', NOW(), '${noReadMsgNum}', '${socket.name}')`
            }
            connection.query(query4, function (error3, results3){
                logError("채팅리스트 테이블에 데이터 집어 넣기 오류 : ",error3)
                //관리자 채팅 목록 업데이트
                var query5 = `SELECT * FROM ChatList ORDER BY dateTime DESC`
                connection.query(query5, function (error4, results4){
                    logError("채팅목록 셀렉트 에러 : ", error4);
                    io.sockets.emit('loadRoom', {chatList: results4})
                })
            })
        })
    })

    /* 접속 종료 */
    socket.on('disconnect', function() {

        if(socket.name != "관리자"){
            console.log(socket.name)
            socket.broadcast.emit('deleteRoom', {roomId: socket.room});
            roomBox = remove(roomBox, socket.name)
        }
        //방에서 이름제거
        roomList[`${socket.room}`] = remove(roomList[`${socket.room}`],socket.name)
        console.log(roomList)

    })
})

/* 서버를 7777 포트로 listen */
server.listen(7777, function() {
    console.log('서버 실행 중...')
})

function remove(arr, item){
    if (arr){
        for(var i = arr.length; i--;){
            if (arr[i] === item){
                arr.splice(i, 1);
            }
        }
    }
    return arr;
}

function logError(where,error){
    if (error) {
        console.log(where,error)
    }
}
