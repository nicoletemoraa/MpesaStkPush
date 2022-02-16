 const { NOW } = require("sequelize/dist");
 const db = require("../models");
 const Paybills = db.paybills;
 const Tokens  = db.tokens;
 const Stkrequests  = db.stkrequests;
 const helpers = require("../helpers/safaricomapi");
 const expiry = require('../helpers/timestamp').expiry; 
 const timestamp = require('../helpers/timestamp').timestamp;
 const stkurl = require('../helpers/constants').stkurl;
 const callbackurl = require("../helpers/constants").callbackurl;
 const Op = db.Sequelize.Op;
 const request = require('request');




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
      await Paybills.findAll({ where: { paybillTill: paybill } })
      .then(data => {
            return data
            

      }).then(data => {
              if(data.length != 0){ 
                const passkey = JSON.stringify(data)
                var jsonObj = JSON.parse(passkey);
                const pkey = jsonObj[0]['passKey']; 
                const ckey = jsonObj[0]['consumerKey'];
                const csecret = jsonObj[0]['consumerSecret'] 
                return PaybillExists(res,stkreq,paybill,pkey,ckey,csecret) 
                                             
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
function PaybillExists(res,stkreq,paybill,pkey,ckey,csecret) {    
      Tokens.findAll({ where: { request_paybill: paybill, expiry_date: {
      [Op.gte]: NOW()} }}).then(resp => { 
          if(resp.length != 0){                       
            var token = JSON.stringify(resp) 
            var jsonObj = JSON.parse(token);
             console.log('found token is',jsonObj[0]['token'])
             var currenttoken = jsonObj[0]['token']                                        
             return foundToken(currenttoken,res,stkreq,pkey,ckey,csecret)          

          }else{
             console.log('Token not found')                      
             return destroyed(resp,stkreq,res,pkey,ckey,csecret)       
        

          }
        
    }); 

}
function destroyed(resp,stkreq,res,pkey,ckey,csecret) {
      Tokens.destroy({ where: { request_paybill: stkreq.paybill }
      })
      .then(num => {         
              console.log('Token has been deleted successfully') 
              helpers.generateToken(ckey,csecret).then(tokengen=>{          
              //save token to db
                  let tokendata = {
                    token:tokengen.access_token,             
                    expiry_date: expiry,
                    request_paybill:stkreq.paybill             
                  };
                  
                  Tokens.create(tokendata)
                  .then(datacreated => {
                    console.log('Token has been saved successfully.')
                  
                  })
                  return foundToken(tokengen.access_token,res,stkreq,pkey,ckey,csecret)
              })                  
        
        
      })

}

async function foundToken(token,res,stkreq,pkey,ckey,csecrets) {
  helpers.pushStk(token,res,stkreq,pkey, function(response) {
    console.log('responded from api',response)

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
              console.log('stk data was saved successfully.')
              res.json({
                message: "stk data was saved successfully."
              });
              return;
            
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
 var data= {
    "Body": 
    {
      "stkCallback": 
      {
        "MerchantRequestID": "93962-27689579-1",
        "CheckoutRequestID": "ws_CO_040220221045384670",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": 
        {
          "Item": 
          [
            {
              "Name": "Amount",
              "Value": 1
            },
            {
              "Name": "MpesaReceiptNumber",
              "Value": "LK451H35OP"
            },
            {
              "Name": "Balance"
            },
            {
              "Name": "TransactionDate",
              "Value": 20171104184944
            },
            {
              "Name": "PhoneNumber",
              "Value": 254727894083
            }
          ]
        }
      }
    }
  }
  //let message = req.body.Body.stkCallback['ResultDesc'];
        let response = data.Body.stkCallback;
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
