const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route");

const app = express();

app.use(express.json());

mongoose
  .connect(
    //Database name: "group-73-Database"
    "mongodb+srv://Vikas:pAeAi3B.8Rhcfa2@cluster0.tnyfk.mongodb.net/group-73-Database",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("MongoDB Connected.");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", route);

app.listen(process.env.PORT || 3000, () => {
  console.log("Express app running on PORT: " + (process.env.PORT || 3000));
});
