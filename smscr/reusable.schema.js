import mongoose from "mongoose";

const daySchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const subjectSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const equipmentSchema = new mongoose.Schema(
  {
    stable_internet: { type: Boolean, required: true },
    noise_cancelling_headphones: { type: Boolean, required: true },
    microphone: { type: Boolean, required: true },
  },
  { _id: false }
);

const nameSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    middlename: { type: String, required: false },
    lastname: { type: String, required: true },
    extname: { type: String, required: false },
    fullname: { type: String, required: true },
  },
  { _id: false }
);

const countrySchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    timezone: { type: String, required: false },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    address_one: { type: String, required: true },
    address_two: { type: String, required: false },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: countrySchema, required: true },
    zip: { type: String, required: true },
  },
  { _id: false }
);

export {
  nameSchema,
  addressSchema,
  subjectSchema,
  daySchema,
  equipmentSchema,
  countrySchema,
};
