module.exports = (sequelize, Sequelize) => {

  const Paybills = sequelize.define('stk_requests', {
    businessShortCode: {

type: Sequelize.STRING

},

msisdn: {

type: Sequelize.STRING

},

amount: {

type: Sequelize.STRING

},

accountReference: {

  type: Sequelize.STRING
  
  },
  
  requesterReferenceId: {
  
  type: Sequelize.STRING
  
  },
  
  requestDestination: {
  
  type: Sequelize.STRING
  
  },



  merchantRequestId: {

    type: Sequelize.STRING
    
    },
    
    checkoutRequestId: {
    
    type: Sequelize.STRING
    
    },
    
    responseCode: {
    
    type: Sequelize.STRING
    
    },
    
    responseDescription: {
    
      type: Sequelize.STRING
      
      },
      
      dateCreated: {
      
      type: Sequelize.STRING
      
      },
      
      mpesaReceiptNumber: {
      
      type: Sequelize.STRING
      
      },
      transactionDate: {
    
        type: Sequelize.STRING
        
        },
        
        dateResponseReceived: {
        
        type: Sequelize.STRING
        
        },
        
        processed: {
        
        type: Sequelize.STRING
        
        },
  



}, {
    timestamps: false
});


return Paybills;

};

