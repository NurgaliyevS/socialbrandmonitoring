# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas integration for capturing emails in your Next.js application.

## Prerequisites

1. A MongoDB Atlas account
2. A MongoDB Atlas cluster
3. Your MongoDB connection string

## Setup Steps

### 1. Install Dependencies

First, install mongoose in your project:

```bash
npm install mongoose
```

### 2. Environment Variables

Create a `.env.local` file in your project root and add your MongoDB connection string:

```env
MONGODB_API_KEY=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Important:** Replace the connection string with your actual MongoDB Atlas connection string.

### 3. MongoDB Atlas Configuration

1. **Create a Database**: In your MongoDB Atlas dashboard, create a new database (e.g., `reddit-whisperer`)
2. **Create a Collection**: Create a collection named `emails` in your database
3. **Network Access**: Ensure your IP address is whitelisted in MongoDB Atlas Network Access settings
4. **Database User**: Create a database user with read/write permissions

### 4. Connection String Format

Your MongoDB Atlas connection string should look like this:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

Replace:
- `<username>`: Your MongoDB Atlas username
- `<password>`: Your MongoDB Atlas password
- `<cluster>`: Your cluster name
- `<database>`: Your database name

### 5. Testing the Connection

1. Start your development server: `npm run dev`
2. Open the email capture modal on your website
3. Submit an email address
4. Check your MongoDB Atlas dashboard to see if the email was saved

## Features

The MongoDB integration includes:

- **Email Validation**: Server-side email format validation
- **Duplicate Prevention**: Prevents duplicate email addresses
- **Source Tracking**: Tracks where emails were captured (hero, pricing, modal)
- **Timestamp Recording**: Automatically records when emails were submitted
- **API Endpoints**: 
  - `POST /api/emails` - Save new email
  - `GET /api/emails` - Retrieve all emails
- **Email Manager**: Admin interface to view and download captured emails

## Database Schema

The email documents in MongoDB will have this structure:

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "source": "modal",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check your connection string and network access settings
2. **Authentication Error**: Verify your username and password
3. **Network Error**: Ensure your IP is whitelisted in MongoDB Atlas

### Environment Variables

Make sure your `.env.local` file is in the project root and contains the correct MongoDB connection string.

### Development vs Production

- **Development**: Use your local `.env.local` file
- **Production**: Set the `MONGODB_API_KEY` environment variable in your hosting platform (Vercel, Netlify, etc.)

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for sensitive information
- Consider using MongoDB Atlas IP whitelist for additional security
- Regularly rotate your database passwords 