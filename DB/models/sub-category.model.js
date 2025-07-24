import mongoose, { Schema, model } from 'mongoose'



const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // TODO: Change to true after adding authentication
    },
    image: {
        secure_url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
            unique: true,
        }
    },
    customId: {
        type: String,
        required: true,
        unique: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true, // Ensure that a subcategory belongs to a category
    }

}, { timestamps: true }
);

export const SubCategory =
    mongoose.models.SubCategory || model('SubCategory', subCategorySchema);

