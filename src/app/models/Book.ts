// models/Book.ts
import mongoose, { Schema, Document } from 'mongoose';

interface Book extends Document {
    title: string;
    author: string;
    yearPublished: number;
}

const bookSchema: Schema<Book> = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    yearPublished: { type: Number, required: true },
});

// Use `mongoose.models` to check if the model is already defined
const BookModel = mongoose.models.Book || mongoose.model<Book>('Book', bookSchema);

export default BookModel;
