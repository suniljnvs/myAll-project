const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { type: ObjectId, ref: "Author", required: true },
    tags: [String],
    category: { type: String, required: true },

    subcategory: [String],

    deletedAt: String,

    isDeleted: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },

    publishedAt: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
