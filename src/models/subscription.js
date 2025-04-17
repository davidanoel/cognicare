import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tier: { type: String, enum: ["free", "paid"], required: true },
  status: { type: String, enum: ["active", "trial", "cancelled"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

subscriptionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Subscription =
  mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
