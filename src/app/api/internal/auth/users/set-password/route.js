import { prisma } from "../../../../../../lib/prisma";


// Example API route for setting password
export async function POST(req) {
  const { email, password } = await req.json();
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.users.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  return Response.json({ success: true });
}