import mongoose from "mongoose";

const savedNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      required: true,
    },

    // ♻️ Recycle Bin
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically permanently delete the note
// 30 days after it enters the recycle bin.
savedNoteSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: {
      deletedAt: { $type: "date" },
    },
  }
);

export default mongoose.model("SavedNote", savedNoteSchema);