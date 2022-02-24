//we come up with the current timestamp
const current_timestamp =() => {
    let year = new Date().getFullYear();

    let month = new Date().getMonth()+1;

    month = month < 10 ? `0${month}` : month;

    let day = new Date().getDay();

    day = day < 10 ? `0${day}` : day;

    let hour = new Date().getHours();

    hour = hour < 10 ? `0${hour}` : hour;

    let minute = new Date().getMinutes();

    minute = minute < 10 ? `0${minute}` : minute;

    let second = new Date().getSeconds();

    second = second < 10 ? `0${second}` : second;   
    return `${year}${month}${day}${hour}${minute}${second}`;

};
const expiry_date =()=>{
    var minutesToAdd=50;
    var currentDate = new Date();
    var futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
    return futureDate;
};

module.exports = {
    timestamp : current_timestamp(),
    expiry:expiry_date(),
};

