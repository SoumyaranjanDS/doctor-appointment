const { Webhook } = require('svix');
const User = require('../models/User');

const clerkWebhook = async (req, res) => {
    // Check if the webhook secret exists
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Get the headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Error occurred -- no svix headers' });
    }

    // Get the body
    const payload = req.body;
    const body = req.body.toString('utf8');

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err.message);
        return res.status(400).json({ error: 'Error occurred' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

    try {
        if (eventType === 'user.created' || eventType === 'user.updated') {
            const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
            
            const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : '';
            
            await User.findOneAndUpdate(
                { clerkId },
                {
                    clerkId,
                    email,
                    firstName: first_name || '',
                    lastName: last_name || '',
                    profileImageUrl: image_url || ''
                },
                { upsert: true, new: true }
            );
            
            console.log(`User synced to database: ${clerkId}`);
        } else if (eventType === 'user.deleted') {
            const { id: clerkId } = evt.data;
            await User.findOneAndDelete({ clerkId });
            console.log(`User deleted from database: ${clerkId}`);
        }

        return res.status(200).json({
            success: true,
            message: 'Webhook received'
        });
    } catch (error) {
        console.error('Error processing webhook event:', error);
        return res.status(500).json({ error: 'Internal server error processing webhook' });
    }
};

module.exports = {
    clerkWebhook
};
