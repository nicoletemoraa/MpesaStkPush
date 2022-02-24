module.exports = {
  HOST: "localhost",
  USER: "root",
  port: 3306,
  PASSWORD: " ",
  DB: "mpesa",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};