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

// database.getConnection((err, dbConnection) => {
// 	if (!err) {
// 		console.log("Successfully connected to MySQL");
// 	}
// 	else {
// 		console.log("Error Connecting to MySQL");
// 		console.log(err);
// 	}
// });

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use("/", router);

async function connect() {
  try {
    await database.connect();
    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    console.error("Connection to MongoDB failed:", error);
  }
}

async function startServer() {
  try {
    await connect(); // Wait for database connection to establish
    console.log("Successfully connected to MongoDB");

    // Start listening for requests after establishing the database connection
    app.listen(port, () => {
      console.log(`Node application listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();
