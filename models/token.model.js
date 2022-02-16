module.exports = (sequelize, Sequelize) => {

  const Tokens = sequelize.define('tokens', {
    token: {

    type: Sequelize.STRING

    },
   
    expiry_date: {

    type: Sequelize.DATE

    },
    request_paybill: {

    type: Sequelize.STRING

    },

  
    }, {
        timestamps: false
    });


return Tokens;

};