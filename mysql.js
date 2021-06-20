connection.connect();

var query = `INSERT into Chat (name, message, dateTime, room, isRead, time) VALUES ('2','2',now(),'2','1','2')`
connection.query(query, function (error, results) {
    console.log(results[0]);
});

connection.end();