import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import LinkedIn from "next-auth/providers/linkedin";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordEmail } from "./lib/email";

// Secure password generator
function generateSecurePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
  const insertPos = Math.floor(Math.random() * password.length);
  return password.slice(0, insertPos) + randomSpecial + password.slice(insertPos);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Sanitize inputs
          const email = credentials.email.toString().trim().toLowerCase();
          const password = credentials.password.toString().trim();

          console.log(`🔐 Login attempt for email: ${email}`);

          // Find user with matching email (latest first)
          let user;
          try {
            console.log(`🔍 Looking up user with email: ${email}`);
            user = await prisma.users.findFirst({
              where: { email },
              orderBy: { created_at: 'desc' }
            });
            console.log(`🔍 User lookup result:`, user ? `Found user ID ${user.id}` : 'No user found');
            
            if (user) {
              console.log(`🔍 User details:`, {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                user_type: user.user_type,
                hasPassword: !!user.password
              });
            }
          } catch (dbError) {
            console.error("❌ Database error during user lookup:", dbError);
            throw new Error("Database connection error. Please try again later.");
          }

          if (!user) {
            console.warn(`❌ Login attempt for non-existent email: ${email}`);
            const errorMsg = "USER_NOT_FOUND: Please sign up first. This email is not registered.";
            console.log(`🔍 Throwing error: ${errorMsg}`);
            throw new Error(errorMsg);
          }

          if (!user.password) {
            console.warn(`❌ Password login attempt for social user: ${email}`);
            const errorMsg = "SOCIAL_USER: Please use the password sent to your email or sign in with your social provider";
            console.log(`🔍 Throwing error: ${errorMsg}`);
            throw new Error(errorMsg);
          }

          // Verify password
          console.log(`🔍 Comparing passwords for user: ${email}`);
          console.log(`🔍 Input password length: ${password.length}`);
          console.log(`🔍 Stored password hash exists: ${!!user.password}`);
          
          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log(`🔍 Password match result: ${passwordMatch}`);
          
          if (!passwordMatch) {
            console.warn(`❌ Invalid password attempt for user: ${email}`);
            const errorMsg = "WRONG_PASSWORD: The password you entered is incorrect. Please check your password and try again.";
            console.log(`🔍 Throwing error: ${errorMsg}`);
            throw new Error(errorMsg);
          }

          console.log(`✅ Password verified for user: ${email}`);

          // Determine user role based on user_type
          let role = 'user';
          
          if (user.user_type === 'admin') {
            role = 'admin';
            console.log(`👑 User ${email} is admin`);
          } else if (user.user_type === 'student') {
            role = 'student';
            console.log(`🎓 User ${email} is student`);
          } else if (user.user_type === 'consultant') {
            role = 'consultant';
            console.log(`💼 User ${email} is consultant`);
          }

          console.log(`✅ Login successful for ${email} as ${role}`);

          // Return user object with basic info only
          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name || ''}`.trim(),
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            nationality: user.country || '',
            city: user.city || '',
            role,
            user_type: user.user_type
          };
        } catch (error) {
          console.error("❌ Authorization error:", error.message);
          
          // Preserve specific error messages
          if (error.message.includes('USER_NOT_FOUND:') || 
              error.message.includes('WRONG_PASSWORD:') || 
              error.message.includes('SOCIAL_USER:') ||
              error.message.includes('Database connection error')) {
            throw error; // Re-throw the specific error as-is
          }
          
          // For other errors, provide a generic message
          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          first_name: profile.given_name,
          last_name: profile.family_name,
          phone: '',
          nationality: '',
          city: '',
          program_type: '',
          gender: null,
          role: 'student',
          user_type: 'student'
        };
      },
    }),

    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      async profile(profile) {
        const nameParts = profile.name?.split(' ') || [];
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          first_name: nameParts[0] || profile.login,
          last_name: nameParts.slice(1).join(' ') || 'User',
          phone: '',
          nationality: '',
          city: '',
          program_type: '',
          gender: null,
          role: 'student',
          user_type: 'student'
        };
      },
    }),

    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          first_name: profile.given_name,
          last_name: profile.family_name,
          phone: '',
          nationality: '',
          city: '',
          program_type: '',
          gender: null,
          role: 'student',
          user_type: 'student'
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'credentials') {
          return true;
        }

        // Sanitize email
        const email = user.email?.toString().trim().toLowerCase();
        if (!email) {
          throw new Error("Email is required");
        }

        let existingUser = await prisma.users.findFirst({
          where: { email },
          orderBy: { created_at: 'desc' }
        });

        if (!existingUser) {
          const generatedPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);

          const fullName = `${user.first_name || (user.name)?.split(' ')[0] || 'Unknown'} ${user.first_name || (user.name)?.split(' ').slice(1).join(' ') || 'User'}`;

          existingUser = await prisma.users.create({
            data: {
              email,
              first_name: user.first_name || (user.name)?.split(' ')[0] || 'Unknown',
              last_name: user.last_name || (user.name)?.split(' ').slice(1).join(' ') || 'User',
              phone: '',
              password: hashedPassword,
              user_type: 'student',
              city: '',
              country: '',
            }
          });

          // Try to create student record, but don't fail if it doesn't work
          try {
            await prisma.students.create({
              data: {
                user_id: existingUser.id,
                name: fullName.trim(),
                city: '',
                nationality: '',
                gender: 'MALE',
                prefered_program: '',
              }
            });
          } catch (studentError) {
            console.warn("Could not create student record:", studentError.message);
            // Continue without student record
          }

          await sendPasswordEmail({
            email,
            name: user.first_name || user.name || 'User',
            password: generatedPassword
          });
        } else {
          await prisma.users.update({
            where: { id: existingUser.id },
            data: {
              first_name: user.first_name || existingUser.first_name,
              last_name: user.last_name || existingUser.last_name,
            }
          });

          if (existingUser.user_type === 'student') {
            // Try to check if student record exists, but don't fail if it doesn't work
            try {
              const existingStudent = await prisma.students.findFirst({
                where: { user_id: existingUser.id }
              });
              
              if (!existingStudent) {
                const fullName = `${existingUser.first_name} ${existingUser.last_name}`;
                await prisma.students.create({
                  data: {
                    user_id: existingUser.id,
                    name: fullName.trim(),
                    city: '',
                    nationality: '',
                    gender: 'MALE',
                    prefered_program: '',
                  }
                });
              }
            } catch (studentError) {
              console.warn("Could not handle student record:", studentError.message);
              // Continue without student record
            }
          }

          if (!existingUser.password) {
            const generatedPassword = generateSecurePassword();
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
            
            await prisma.users.update({
              where: { id: existingUser.id },
              data: { password: hashedPassword }
            });

            await sendPasswordEmail({
              email,
              name: user.first_name || existingUser.first_name || 'User',
              password: generatedPassword
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return `/auth/error?message=${encodeURIComponent(error.message)}`;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.user_type = user.user_type || user.role || 'user';
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.phone = user.phone;
        token.nationality = user.nationality;
        token.city = user.city;
        token.program_type = user.program_type;
        token.gender = user.gender;
        token.provider = account?.provider;
        
        if (user.role === 'consultant') {
          token.company_name = user.company_name;
          token.designation = user.designation;
          token.state = user.state;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.user_type = token.user_type;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.phone = token.phone;
        session.user.nationality = token.nationality;
        session.user.city = token.city;
        session.user.program_type = token.program_type;
        session.user.gender = token.gender;
        session.user.provider = token.provider;
        
        if (token.role === 'consultant') {
          session.user.company_name = token.company_name;
          session.user.designation = token.designation;
          session.user.state = token.state;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('🔍 Redirect callback called:', { url, baseUrl });
      
      // Handle specific error cases
      if (url.includes('error=')) {
        console.log('🔍 Error redirect detected:', url);
        return `${baseUrl}/student-login?error=${encodeURIComponent(url)}`;
      }
      
      // Handle social login redirects
      if (url.includes('Please%20use%20the%20password%20sent%20to%20your%20email')) {
        return `${baseUrl}/student-login?error=social_user`;
      }
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Handle external URLs (only if they're from our domain)
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default fallback
      return baseUrl;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: '/student-login', // Changed from '/auth/signin' to actual login page
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/dashboard',
  },

  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
});