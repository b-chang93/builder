"use strict";

module.exports = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost/workout-app",
  TEST_BUILDR_DATABASE: process.env.TEST_BUILDR_DATABASE || "mongodb://localhost/buildr-test-db",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d"
}
