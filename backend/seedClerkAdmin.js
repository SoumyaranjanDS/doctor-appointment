require('dotenv').config();
const { createClerkClient } = require('@clerk/express');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY });

async function seedAdmin() {
  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [process.env.ADMIN_EMAIL || 'admin@dcp.com'],
      password: 'DCPAdmin@123456', // A stronger password to bypass pwned password checks
      publicMetadata: { role: 'admin' },
      firstName: 'System',
      lastName: 'Admin'
    });
    console.log('Admin user created successfully in Clerk:', user.id);
  } catch (error) {
    console.error('Error creating admin user:', JSON.stringify(error.errors, null, 2) || error);
  }
}

seedAdmin();
