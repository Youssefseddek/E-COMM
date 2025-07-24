import mongoose, { Schema, model } from 'mongoose'



const brandSchema = new Schema({
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
    logo: {
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
        required: true, // Ensure that a brand belongs to a category
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true, // Ensure that a brand belongs to a subcategory
    }

}, { timestamps: true }
);

export const Brand =
    mongoose.models.Brand || model('Brand', brandSchema);

