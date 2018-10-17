"use strict";

exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/workout-app";

// exports.TEST_BUILDR_DATABASE =
//   process.env.TEST_BUILDR_DATABASE || "mongodb://localhost/workout-test-app";
exports.TEST_BUILDR_DATABASE =
  process.env.TEST_BUILDR_DATABASE || "mongodb://localhost/buildr-test-db";

exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
