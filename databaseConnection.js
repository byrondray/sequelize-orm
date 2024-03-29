const { MongoClient, ServerApiVersion } = require("mongodb");
const is_qoddi = process.env.IS_QODDI || false;
const qoddiURI =
  "mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.rnp4igh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const localURI =
  "mongodb://127.0.0.1/?authSource=admin&retryWrites=true&w=majority";

const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1, // Add this line
};

var database;
if (is_qoddi) {
  database = new MongoClient(qoddiURI, clientOptions);
} else {
  database = new MongoClient(localURI, clientOptions);
}

module.exports = database;
