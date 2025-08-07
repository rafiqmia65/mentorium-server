require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");

const port = process.env.PORT || 3000;

// Connect Database
connectDb();

app.listen(port, () => {
  console.log(`🚀 Mentorium app listening on port ${port}`);
});
