const mongoose = require("mongoose");
require("dotenv").config();


// Connexion à la deuxième base de données
const db2france = mongoose.createConnection(process.env.Databasefrance, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

db2france.on("error", (err) => console.log("Erreur DB2:", err));
db2france.once("open", () => console.log("Connexion à DB2 établie"));

module.exports = {  db2france };
