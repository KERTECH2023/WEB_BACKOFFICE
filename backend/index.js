var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require('dotenv').config();

const { db2france } = require("./configbasefrance");

const { synchronizeData } = require("./Controllers/ChauffContro");

const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const config = require("./config.json");
const AuthRoute = require("./routes/adminRoutes");
const Agentrout = require("./routes/AgentRoute");
const Agentchauff = require("./routes/ChauffeurRoute");
const ClRoute = require("./routes/ClientRoute");
const Rec = require("./routes/ReclamationRout");
const Voi = require("./routes/VoitureRoutes");
const gpsroute = require("./routes/gpsRoutes");
const tar = require("./routes/TarifRoute");
const tarj = require("./routes/TarifRouteJour.js");
const tart = require("./routes/tarifsRoutes.js");
const tarn = require("./routes/TarifRouteNuit.js");
const transfert = require("./routes/TransfertRoutes.js");
const Solde = require("./routes/SoldeRoute.js");
const rideRequests = require("./routes/rideRequests.js");
const tariftransfet = require("./routes/TariftransfertRoute.js");
const reservationTaxi = require("./routes/ReservationTaxiRoutes.js");
const con = require("./routes/ContactRoute");
const rides = require("./routes/RideRoute");
const factureRoute = require("./routes/factureRoutes.js")
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { runAggregation } = require("./Controllers/RideController"); // Export runAggregation function
const {
  generateFactures,
  generateDriverStatistics,
} = require("./Controllers/FactureController");










const { synchronizeDatafr } = require("./Controllersfr/ChauffContro");

const gpsroutefr = require("./routesfr/gpsRoutes");
const AuthRoutefr = require("./routesfr/adminRoutes");
const Agentroutfr = require("./routesfr/AgentRoute");
const Agentchaufffr = require("./routesfr/ChauffeurRoute");
const ClRoutefr = require("./routesfr/ClientRoute");
const Recfr = require("./routesfr/ReclamationRout");
const Voifr = require("./routesfr/VoitureRoutes");
const tarfr = require("./routesfr/TarifRoute");
const tarjfr = require("./routesfr/TarifRouteJour.js");
const tartfr = require("./routesfr/tarifsRoutes.js");
const tarnfr = require("./routesfr/TarifRouteNuit.js");
const transfertfr = require("./routesfr/TransfertRoutes.js");
const Soldefr = require("./routesfr/SoldeRoute.js");
const rideRequestsfr = require("./routesfr/rideRequests.js");
const tariftransfetfr = require("./routesfr/TariftransfertRoute.js");
const reservationTaxifr = require("./routesfr/ReservationTaxiRoutes.js");
const confr = require("./routesfr/ContactRoute");
const ridesfr = require("./routesfr/RideRoute");
const whatsappRoutes = require('./routesfr/whatsappRoutes');

var indexRouterfr = require("./routesfr/index");
var usersRouterfr = require("./routesfr/users");
const { runAggregationfr } = require("./Controllersfr/RideController"); // Export runAggregation function

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", (err) => {
  console.log(err);
});

db.once("open", () => {
  console.log("DB Connection Estabblished !");
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
const corsOptions = {
  // origin:'https://front-admin-vert.vercel.app',

  origin: "*",

  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/gpspostion", gpsroute);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", AuthRoute);
app.use("/agent", Agentrout);
app.use("/Chauff", Agentchauff);
app.use("/Client", ClRoute);
app.use("/Rec", Rec);
app.use("/Voi", Voi);
app.use("/Tar", tar);
app.use("/transfer", transfert);
app.use("/tariftransfet", tariftransfet);
app.use("/reservationTaxi", reservationTaxi);

app.use("/Tarj", tarj);
app.use("/Tart", tart);
app.use("/Tarn", tarn);
app.use("/Solde", Solde);
app.use("/rideRequests", rideRequests);
app.use("/Con", con);
app.use("/facture",factureRoute);

app.use("/Ride", rides);

app.get("/testAggregation", async (req, res) => {
  try {
    // await runAggregation();
    await generateFactures();
    const stats = await generateDriverStatistics();
    res
      .status(200)
      .json({
        message: "Aggregation executed successfully.",
        statistics: stats,
      });
  } catch (error) {
    console.error("Error during manual aggregation:", error);
    res.status(500).json({ message: "Error during manual aggregation." });
  }
});



// france


app.use("/gpspostionfr", gpsroutefr);
app.use("/fr", indexRouterfr);
app.use("/usersfr", usersRouterfr);
app.use("/apifr", AuthRoutefr);
app.use("/agentfr", Agentroutfr);
app.use("/Chaufffr", Agentchaufffr);
app.use("/Clientfr", ClRoutefr);
app.use("/Recfr", Recfr);
app.use("/Voifr", Voifr);
app.use("/Tarfr", tarfr);
app.use("/transferfr", transfertfr);
app.use("/tariftransfetfr", tariftransfetfr);
app.use("/reservationTaxifr", reservationTaxifr);

app.use("/Tarjfr", tarjfr);
app.use("/Tartfr", tartfr);
app.use("/Tarnfr", tarnfr);
app.use("/Soldefr", Soldefr);
app.use("/rideRequestsfr", rideRequestsfr);
app.use("/Confr", confr);
app.use('/whatsapp', whatsappRoutes);

app.use("/Ridefr", ridesfr);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Define an asynchronous function to start the server and initiate data synchronization

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Call the startServer function to start the server

module.exports = app;
