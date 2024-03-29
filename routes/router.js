const router = require("express").Router();
const database = include("databaseConnection");
const Joi = require("joi");
const ObjectId = require("mongodb").ObjectId;
//const dbModel = include('databaseAccessLayer');
//const dbModel = include('staticData');

// const userModel = include('models/web_user');
// const petModel = include('models/pet');

const crypto = require("crypto");
const { v4: uuid } = require("uuid");

const passwordPepper = "SeCretPeppa4MySal+";
const idSchema = Joi.string()
  .length(24)
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

router.get("/", async (req, res) => {
  console.log("page hit");
  try {
    const userCollection = database.db("lab_example").collection("users");
    const users = await userCollection
      .find()
      .project({ first_name: 1, last_name: 1, email: 1, _id: 1 })
      .toArray();
    if (users === null) {
      res.render("error", { message: "Error connecting to MySQL" });
      console.log("Error connecting to userModel");
    } else {
      console.log(users);
      res.render("index", { allUsers: users });
    }
  } catch (ex) {
    res.render("error", { message: "Error connecting to MySQL" });
    console.log("Error connecting to MySQL");
    console.log(ex);
  }
});

router.get("/pets", async (req, res) => {
  console.log("page hit");
  try {
    const db = await database.db("lab_example"); // Make sure to connect to the database
    const petsCollection = db.collection("pets");
    const pets = await petsCollection
      .find({}, { projection: { name: 1 } })
      .toArray();

    if (!pets || pets.length === 0) {
      res.render("error", { message: "No pets found" });
    } else {
      res.render("pets", { allPets: pets });
    }
  } catch (ex) {
    res.render("error", { message: "Error fetching pets" });
    console.log(ex);
  }
});

router.get("/showPets", async (req, res) => {
  console.log("page hit");
  try {
    const { error, value: userId } = idSchema.validate(req.query.id);
    if (error) {
      throw new Error(`Invalid user ID: ${error.details[0].message}`);
    }

    const db = await database.db("lab_example");
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      res.render("error", { message: "User not found" });
    } else {
      const petsCollection = db.collection("pets");
      const pets = await petsCollection
        .find({ ownerId: new ObjectId(userId) })
        .toArray();
      res.render("pets", { allPets: pets });
    }
  } catch (ex) {
    res.render("error", { message: ex.message || "Error fetching pets" });
    console.log(ex);
  }
});

router.get("/deleteUser", async (req, res) => {
  try {
    console.log("delete user");

    // Check if 'id' parameter exists
    const userId = req.query.id;
    if (!userId) {
      throw new Error("No user ID provided.");
    }

    // Define your Joi schema for the user ID
    const idSchema = Joi.string()
      .length(24)
      .regex(/^[0-9a-fA-F]{24}$/)
      .required();

    // Validate the 'id' URL parameter
    const { error } = idSchema.validate(userId);
    if (error) {
      throw new Error(`Invalid user ID: ${error.details[0].message}`);
    }

    // Connect to the database and delete the user
    const db = await database.db("lab_example");
    const userCollection = db.collection("users");

    const deleteResult = await userCollection.deleteOne({
      _id: new ObjectId(userId),
    });
    if (deleteResult.deletedCount === 0) {
      throw new Error("User not found or already deleted");
    }

    console.log(`User with ID ${userId} deleted`);
    res.redirect("/");
  } catch (ex) {
    res.render("error", { message: ex.message || "Error deleting user" });
    console.log(ex);
  }
});

router.post("/addUser", async (req, res) => {
  try {
    console.log("form submit");

    // Validate the user input with Joi
    const userSchema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(), // Add additional password requirements as needed
    });

    const validationResult = userSchema.validate(req.body);
    if (validationResult.error) {
      throw validationResult.error;
    }

    // Continue with password creation only after validation passes
    const passwordSalt = crypto.randomBytes(16).toString("hex"); // Create a new random salt for each user
    const passwordHash = crypto.createHash("sha512");
    passwordHash.update(req.body.password + passwordPepper + passwordSalt); // Combine and hash the password with the salt and pepper

    // Connect to the database and insert the new user
    const db = await database.db("lab_example");
    const userCollection = db.collection("users");

    await userCollection.insertOne({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password_salt: passwordSalt,
      password_hash: passwordHash.digest("hex"),
    });

    res.redirect("/"); // Redirect to the home page or to a success page
  } catch (ex) {
    res.render("error", { message: "Error adding user" }); // Make sure to update the error message
    console.log("Error adding user");
    console.log(ex);
  }
});

/*
router.get('/', (req, res) => {
	console.log("page hit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			
			dbModel.getAllUsers((err, result) => {
				if (err) {
					res.render('error', {message: 'Error reading from MySQL'});
					console.log("Error reading from mysql");
					console.log(err);
				}
				else { //success
					res.render('index', {allUsers: result});

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			dbConnection.release();
		}
	});
});
*/

/*
router.post('/addUser', (req, res) => {
	console.log("form submit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.body);
			dbModel.addUser(req.body, (err, result) => {
				if (err) {
					res.render('error', {message: 'Error writing to MySQL'});
					console.log("Error writing to mysql");
					console.log(err);
				}
				else { //success
					res.redirect("/");

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			
			dbConnection.release();
		}
	});

});
*/

/*
router.get('/deleteUser', (req, res) => {
	console.log("delete user");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.query);

			let userId = req.query.id;
			if (userId) {
				dbModel.deleteUser(userId, (err, result) => {
					if (err) {
						res.render('error', {message: 'Error writing to MySQL'});
						console.log("Error writing to mysql");
						console.log(err);
					}
					else { //success
						res.redirect("/");

						//Output the results of the query to the Heroku Logs
						console.log(result);
					}
				});
			}
			else {
				res.render('error', {message: 'Error on Delete'});
			}
		
			dbConnection.release();
		}
	});
});
*/

module.exports = router;
