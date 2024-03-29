const MongoClient = require("mongodb").MongoClient;
const is_qoddi = process.env.IS_QODDI || false;
const qoddiURI =
  "mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.rnp4igh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const localURI =
  "mongodb://127.0.0.1/?authSource=admin&retryWrites=true&w=majority";
if (is_qoddi) {
  var database = new MongoClient(qoddiURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} else {
  var database = new MongoClient(localURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

database.connect((err) => {
  if (err) {
    console.error("Connection error:", err);
  } else {
    console.log("Connected to MongoDB");
  }
});

module.exports = database;
