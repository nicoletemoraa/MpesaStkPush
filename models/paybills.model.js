module.exports = (sequelize, Sequelize) => {

  const Paybills = sequelize.define('paybills_tills', {
    paybillTill: {

type: Sequelize.STRING

},

transactionType: {

type: Sequelize.STRING

},

consumerKey: {

type: Sequelize.STRING

},

passKey: {

  type: Sequelize.STRING
  
  },

consumerSecret: {

  type: Sequelize.STRING
  
  },

  status: {
    type: Sequelize.ENUM("active", "inactive"),
  },

  environment_type: {
    type: Sequelize.ENUM("sandbox", "live"),
  },
  token: {

    type: Sequelize.STRING

    },
   
    expiry_date: {

    type: Sequelize.DATE

    },
    token_date_created: {

      type: Sequelize.DATE
  
      },
}, {
    timestamps: false
});


return Paybills;

};