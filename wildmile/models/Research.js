const CsoEventSchema = new mongoose.Schema({
  outfallStructure: { type: String },
  location: { type: PointSchema },
  tideGateNumber: { type: String },
  waterwayReach: { type: String },
  plant: { type: String },
  openDateTime: { type: Date },
  closeDateTime: { type: Date },
});
