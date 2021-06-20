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

    if(hour < 10)
        hour = "0" + hour;
    if(minute <10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    dsp_ampm = str_ampm+" "+hour+" : "+minute
    return dsp_ampm;
}

//실제 펑션
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

var dateTimeFromDbToday = '2020-12-22 18:58:56';

//테스트 펑션
function testFunction(dateTimeFromDb){
    if (dateTimeFromDb == '2020-12-24 18:58:56' ){
        if (getDateOrTime(dateTimeFromDb) == 'time'){
            console.log('success')
        }else {
            console.log('fail')
        }
    }else if (dateTimeFromDb == '2020-12-23 18:58:56'){
        if (getDateOrTime(dateTimeFromDb) == 'yesterday'){
            console.log('success')
        }else {
            console.log('fail')
        }
    }else{
        if (getDateOrTime(dateTimeFromDb) == 'date'){
            console.log('success')
        }else {
            console.log('fail')
        }
    }
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
    console.log(fullDate1-fullDate2)
    return result;
}

var dateTimeFromDbToday = '2020-12-24 18:58:56';
var dateTimeFromDbYes = '2020-12-23 18:58:56';
var dateTimeFromDbBefore = '2020-12-22 18:58:56';
var dateTimeFromDbBefore2 = '2020-12-20 18:58:56';

compareDate(dateTimeFromDbToday,dateTimeFromDbYes)
console.log("테스트",compareDate(dateTimeFromDbToday,dateTimeFromDbBefore))
console.log(testFunction(dateTimeFromDbToday))