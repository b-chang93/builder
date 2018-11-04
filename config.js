"use strict";

module.exports = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost/builder-db",
  TEST_BUILDER_DATABASE: process.env.TEST_BUILDER_DATABASE || "mongodb://localhost/builder-test-db",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
  DEFAULT_AVATAR: "/images/workout-bear.gif"
}
