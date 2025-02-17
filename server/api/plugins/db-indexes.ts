// server/plugins/db-indexes.ts
import { Db } from 'mongodb'

export default defineNitroPlugin(async (nitroApp) => {
  // Get MongoDB connection
  const db: Db = nitroApp.mongodb // or however you access your MongoDB instance

  try {
    // Users collection indexes
    await db.collection('users').createIndex(
      { "email": 1 }, 
      { unique: true }
    )

    // Accounts collection indexes
    await db.collection('accounts').createIndex(
      { "provider": 1, "providerAccountId": 1 }, 
      { unique: true }
    )
    await db.collection('accounts').createIndex(
      { "userId": 1 }
    )

    // Sessions collection indexes
    await db.collection('sessions').createIndex(
      { "sessionToken": 1 }, 
      { unique: true }
    )
    await db.collection('sessions').createIndex(
      { "userId": 1 }
    )

    // VerificationTokens collection indexes
    await db.collection('verificationTokens').createIndex(
      { "token": 1 }, 
      { unique: true }
    )
    await db.collection('verificationTokens').createIndex(
      { "identifier": 1, "token": 1 }, 
      { unique: true }
    )

    // TwoFactorAuth collection indexes
    await db.collection('twoFactorAuth').createIndex(
      { "userId": 1 }, 
      { unique: true }
    )

    console.log('MongoDB indexes created successfully')
  } catch (error) {
    console.error('Error creating MongoDB indexes:', error)
  }
})