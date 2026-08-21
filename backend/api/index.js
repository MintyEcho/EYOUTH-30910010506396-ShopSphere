const app = require("../src/app");
const connectMongo = require("../src/config/mongo");

// On Vercel, src/index.js (the local entry that calls app.listen) never runs,
// so the Mongo connection must be started here as well.
connectMongo().catch((err) => console.error("Mongo connection failed:", err.message));

module.exports = app;