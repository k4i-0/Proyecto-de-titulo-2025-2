const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtExpire = "24h";
const jwtRefreshExpire = "7d";

module.exports = {
  jwtSecret,
  jwtExpire,
  jwtRefreshSecret,
  jwtRefreshExpire,
};
