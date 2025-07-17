import { Webhook } from 'svix';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

async function handleUserCreated(userData) {
  try {
    const user = await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: userData.email_addresses[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        imageUrl: userData.image_url || '',
        lastLogin: new Date(),
      },
    });
    
    console.log('User created in database:', user.id);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function handleUserUpdated(userData) {
  try {
    const user = await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        imageUrl: userData.image_url || '',
        lastLogin: new Date(),
      },
    });
    
    console.log('User updated in database:', user.id);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData) {
  try {
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        isActive: false,
      },
    });
    
    console.log('User deactivated in database:', userData.id);
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}
