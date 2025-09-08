import { auth } from '../../../../../../auth';
import { prisma } from '../../../../../../lib/prisma';
import bcrypt from 'bcrypt';

export const POST = async (request) => {
  const session = await auth();
  
  // Verify user is authenticated
  if (!session?.user?.email) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Find user by email from session (email may not be unique in schema, so use findFirst)
    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password using unique id selector
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return Response.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password change error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};