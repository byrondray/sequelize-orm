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

async function startServer() {
  try {
    // Ensure database is connected
    await database.connect();
    console.log("Successfully connected to MongoDB.");

    // Now that we're connected, start the server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

startServer();
