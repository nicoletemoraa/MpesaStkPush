//we come up with the current timestamp
const callback =()=>{
    let callbackurl = 'https://18.200.205.127/mpesastkin/index.php'; 
    //let callbackurl ='http://localhost:3000/lipa-na-mpesa-callback';     
    return callbackurl;
};
const livetoken =(environment)=>{
    let tokenurl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';       
    return tokenurl;
};
const sandboxtoken =(environment)=>{
    let tokenurl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';       
    return tokenurl;
};
const liveurl =(environment) => {
    let stkurl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';       
    return stkurl;

};
const sandboxurl =(environment) => {
    let stkurl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';       
    return stkurl;

}


module.exports = {
    callbackurl : callback(),
    livetokenurl:livetoken(),
    sandboxtokenurl:sandboxtoken(),
    livestkurl:liveurl(),    
    sandboxstkurl:sandboxurl(),
};


