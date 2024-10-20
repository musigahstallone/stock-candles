import { NextResponse } from 'next/server';
import Book from "@/app/models/Book";
import connectDB from "@/app/db";

// Connect to MongoDB and handle the promise
const connectDatabase = async () => {
    try {
        await connectDB();
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw new Error('Database connection error');
    }
};

// Create new books (bulk addition)
export async function POST(req: Request) {
    await connectDatabase(); // Ensure the database is connected before proceeding
    const body = await req.json();

    // Check if the input is an array
    if (!Array.isArray(body)) {
        return NextResponse.json({ message: 'Invalid input, expected an array of books' }, { status: 400 });
    }

    // Create an array to hold new books
    const newBooks = [];
    const existingTitles = await Book.find({ title: { $in: body.map((book: { title: string }) => book.title) } });

    // Create a Set for existing titles for quick lookup
    const existingTitlesSet = new Set(existingTitles.map(book => book.title));

    for (const book of body) {
        if (!existingTitlesSet.has(book.title)) {
            const newBook = new Book(book);
            await newBook.save();
            newBooks.push(newBook);
        }
    }

    if (newBooks.length === 0) {
        return NextResponse.json({ message: 'No new books added, all titles already exist' }, { status: 409 });
    }

    return NextResponse.json(newBooks, { status: 201 });
}

// Get all books
export async function GET() {
    try {
        await connectDatabase(); // Ensure the database is connected before proceeding
        const books = await Book.find(); // Fetch all books from the database
        return NextResponse.json(books); // Return the books as a JSON response
    } catch (error) {
        console.error('Error fetching books:', error); // Log the error for debugging
        return NextResponse.json(
            { error: 'Failed to fetch books' }, // Return a JSON response with an error message
            { status: 500 } // Set the HTTP status code to 500 (Internal Server Error)
        );
    }
}

// Get a book by ID
export async function GETONE(req: Request, { params }: { params: { id: string } }) {
    await connectDatabase(); // Ensure the database is connected before proceeding
    const { id } = params;
    const book = await Book.findById(id);
    if (!book) {
        return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json(book);
}

// Update a book by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await connectDatabase(); // Ensure the database is connected before proceeding
    const { id } = params;
    const body = await req.json();
    const updatedBook = await Book.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBook) {
        return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json(updatedBook);
}

// Delete a book by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await connectDatabase(); // Ensure the database is connected before proceeding
    const { id } = params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
        return NextResponse.json({ message: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Book deleted' });
}
