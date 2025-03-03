//Define the include function for absolute file name
global.base_dir = __dirname;
global.abs_path = function (path) {
  return base_dir + path;
};
global.include = function (file) {
  return require(abs_path("/" + file));
};

const express = require("express");
const database = include("databaseConnection");
const router = include("routes/router");

const port = process.env.PORT || 3000;

// database.connect((err, dbConnection) => {
//   if (!err) {
//     console.log("Successfully connected to MongoDB");
//   } else {
//     console.log("Error Connecting to MongoDB");
//     console.log(err);
//   }
// });

async function connectToMongo() {
  try {
    await database.connect();
    console.log("Successfully connected to MongoDB");
  } catch (ex) {
    console.log("Error connecting to MongoDB");
    console.log(ex);
  }
}

connectToMongo();

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use("/", router);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
