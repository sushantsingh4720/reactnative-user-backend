import mongoose from "mongoose";

const dbConnect = () => {
  const connectionparams = { useNewUrlParser: true };

  //When the "strict" option is set to "true", Mongoose will only allow values to be saved to the database that have been explicitly defined in the schema. This means that if you try to save a new field to the database that is not defined in the schema, Mongoose will reject the new field
  mongoose.set("strictQuery", true);

  //If "strict" is set to "false", Mongoose will allow new fields to be saved to the database even if they are not defined in the schema. By default, Mongoose's "strict" option is set to "true"
  mongoose.set("strictQuery", false);

  mongoose.connect(process.env.MONGO_URL, connectionparams);

  mongoose.connection.on("connected", () => {
    console.log("Connected to Mongoose server");
  });

  mongoose.connection.on("error", (err) => {
    console.log(`Error connecting to Mongoose server: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Disconnected from Mongoose server");
  });
};

export default dbConnect;
