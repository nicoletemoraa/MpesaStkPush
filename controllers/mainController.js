 const { NOW } = require("sequelize/dist");
const db = require("../models");
 const Paybills = db.paybills;
 const Stkrequests  = db.stkrequests;
 const helpers = require("../helpers/safaricomapi");
 const expiry = require('../helpers/timestamp').expiry; 
 const timestamp = require('../helpers/timestamp').timestamp;
 const stkurl = require('../helpers/constants').stkurl;
 const callbackurl = require("../helpers/constants").callbackurl;
 const Op = db.Sequelize.Op;
 const request = require('request');
const e = require("cors");




 exports.index = async (req, res, next) => { 
  try {    
      //request body should have the following 
      /*paybill
      msisdn
      partyB
      accountReference
      TransactionDesc*/
      
      // Validate request
      if (!req.body.paybill && !req.body.msisdn && !req.body.amount && !req.body.accountReference && !req.body.transactionDesc) {

        res.status(400).json({
          message: "You have not provided all the required params!"
        });
        return;
      }
      const paybill = req.body.paybill;  
      const stkreq =req.body  
         
      await Paybills.findAll({ where: { paybillTill: paybill,status:'active' } })
      .then(data => {
            return data
            

      }).then(data => {
              if(data.length != 0){ 
                const resdata = JSON.stringify(data)
                var jsonObj = JSON.parse(resdata);
                const pkey = jsonObj[0]['passKey']; 
                const ckey = jsonObj[0]['consumerKey'];
                const csecret = jsonObj[0]['consumerSecret']
                const token = jsonObj[0]['token'] 
                const token_expiry = jsonObj[0]['expiry_date'] 
                const environment = jsonObj[0]['environment_type'] 
                return PaybillExists(res,stkreq,paybill,pkey,ckey,csecret,token,token_expiry,environment) 
                                             
              }else{
                return noPaybill(res)                  
                
              }     
        
      })
    
  } catch(err) {
      console.log('error  is',err); // up to you what to do with the error
      
  }
};
function noPaybill(res) {
     console.log("Paybill does not exist.Please contact administrator for assistance");
     res.json({message:"Paybill does not exist.Please contact administrator for assistance"}); 
}
function PaybillExists(res,stkreq,paybill,pkey,ckey,csecret,token,token_expiry,environment) { 
          var d = new Date();
          var timenow = new Date(d.setHours(d.getHours() + 3));                 
          var expiryt = new Date(token_expiry);         
          var expirytime = new Date(expiryt.setHours(expiry.getHours() + 3));       
          

          if(expirytime == "" || timenow > expirytime){
            console.log('TOKEN not found or is has expired')                      
            return destroyed(stkreq,res,pkey,ckey,csecret,environment)  

          }else{
            console.log('TOKEN not expired,it  is:',token)
             var currenttoken = token                                        
             return foundToken(currenttoken,res,stkreq,pkey,ckey,csecret,environment) 

          }
  

}
function destroyed(stkreq,res,pkey,ckey,csecret,environment) {
  helpers.generateToken(ckey,csecret,environment).then(tokengen=>{          
        var d = new Date();
        timecreated = new Date(d.setHours(d.getHours() + 3));        
   
        var values = {token:tokengen.access_token  , expiry_date :expiry,token_date_created:timecreated};
        var condition = { where :{paybillTill: stkreq.paybill} }; 
        options = { multi: true };
        
        Paybills.update(values, condition , options)
                  . then(function(updresult) {
                    console.log("Token has updated successfully.")
                    return foundToken(tokengen.access_token,res,stkreq,pkey,ckey,csecret,environment)                   
                    
                  }).catch(err=>console.log('error: ' + err,)); 
        
    })
    

}

async function foundToken(token,res,stkreq,pkey,ckey,csecrets,environment) {
  helpers.pushStk(token,res,stkreq,pkey,environment, function(response) {
    console.log('RESPONSE from safaricom stk api:',response)

                let stkdata = {          
              businessShortCode : stkreq.paybill,
              msisdn : stkreq.msisdn,
              amount : stkreq.amount,
              accountReference :stkreq.accountReference,
              requesterReferenceId : (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2),
              merchantRequestId : response.MerchantRequestID,
              checkoutRequestId : response.CheckoutRequestID,
                          
              };
            //Save Tutorial in the database
            Stkrequests.create(stkdata)
            .then(created => {
              console.log('STK data was saved successfully.')
              // res.json({
              //   message: "stk data was saved successfully."
              // });            
            
            })
            .catch(err => {
              console.log(err.message || 'Some error occurred while saving stk data.')
              res.json({
                message: "Some error occurred while saving stk data."
              });
              
            });
          
  });      
      
}


exports.lipaNaMpesaOnlineCallback = async (req, res, next) => {
        let response = req.body.Body.stkCallback;  

        console.log('response from callback is',response)


        var MerchantRequestID=response['MerchantRequestID'];
        var CheckoutRequestID=response['CheckoutRequestID'];
        var ResultCode=response['ResultCode'];
        var ResultDesc=response['ResultDesc'];

        let metadata=response['CallbackMetadata']['Item'];

        let Amount= metadata[0]['Value'];
        let MpesaReceiptNumber= metadata[1]['Value'];
        let TransactionDate= metadata[3]['Value'];
        let PhoneNumber= metadata[4]['Value'];

        Stkrequests.findAll({ where: { merchantRequestId: MerchantRequestID, checkoutRequestId:CheckoutRequestID }}).then(resp => { 
              if(resp.length != 0){  
                var values = {mpesaReceiptNumber:MpesaReceiptNumber  , responseCode :ResultCode, responseDescription:ResultDesc };
                var condition = { where :{merchantRequestId: MerchantRequestID} }; 
                options = { multi: true };

                Stkrequests.update(values, condition , options)
                  . then(function(upresult) {
                    res.json({
                      message: "Record has been updated successfully"
                    });
                    
                  }).catch(err=>console.log('error: ' + err,));                      
           
              }else{
                 console.log('Request not found')                      
                       
            
    
              }
            
        });

      
  
};
