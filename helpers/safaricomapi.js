const axios = require('axios');
const request = require('request');
const timestamp = require('../helpers/timestamp').timestamp;
const livetokenurl = require('../helpers/constants').livetokenurl;
 const livestkurl = require('../helpers/constants').livestkurl;
 const sandboxtokenurl = require('../helpers/constants').sandboxtokenurl;
 const sandboxstkurl = require('../helpers/constants').sandboxstkurl;
 const callbackurl = require("../helpers/constants").callbackurl;


 exports.generateToken = async function(ckey,csecret,environment){ 

  console.log('environment',environment)
   if(environment=='live'){
    
    var url = livetokenurl;
   }else{
    
    var url = sandboxtokenurl;

   }
                
    
    let buffer = new Buffer.from(ckey+":"+csecret);
    let auth = `Basic ${buffer.toString('base64')}`; 
    try{

        let {data} = await axios.get(url,{
            "headers":{
                "Authorization":auth
            }
        });
        console.log('SUCCESSFULLY hit safaricom token api',data)
        //var token = data['access_token'];
        return data
        
    }catch(err){
        console.log('FAILED hit safaricom token api',err) 
       

    }
}

exports.pushStk = function(tokendata,res,stkreq,pkey,environment,callback){
  if(environment=='live'){
    var url = livestkurl;
   }else{
    var url = sandboxstkurl;
   } 
    let auth = `Bearer ${tokendata}`;   
    let passkey =pkey;        
    //getting the timestamp
   
    let callbackur =callbackurl;
    let bs_short_code = stkreq.paybill;
    let password = new Buffer.from(`${bs_short_code}${passkey}${timestamp}`).toString('base64');
    let transcation_type = "CustomerPayBillOnline";
    let amount = stkreq.amount; //you can enter any amount
    let partyA = stkreq.msisdn; //should follow the format:2547xxxxxxxx
    let partyB = stkreq.paybill;
    let phoneNumber = stkreq.msisdn; //should follow the format:2547xxxxxxxx
    let accountReference = stkreq.accountReference;
    let transactionDesc = stkreq.transactionDesc; 
    
    var data = JSON.stringify({
        "BusinessShortCode":bs_short_code,
            "Password":password,
            "Timestamp":timestamp,
            "TransactionType":"CustomerPayBillOnline",
            "Amount":amount, 
             "PartyA": partyA,
             "PartyB": partyB,
            "PhoneNumber": phoneNumber,   
            "CallBackURL": callbackur,
            "AccountReference": accountReference,
            "TransactionDesc": transactionDesc
        
      });
      
      var config = {
        method: 'post',
        url: url,
        headers: { 
          'Authorization': auth, 
          'Content-Type': 'application/json'
        },
        data : data
      };
      axios(config)
      .then(function (response) {
        callback(response.data);
        res.send(response.data);
       
      })
      .catch(function (error) {  
        res.send(error.response.data);    
        console.log('ERROR from safaricom api is:',JSON.stringify(error.response.data));
        //console.log(error.response.data);
      });
  }
