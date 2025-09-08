import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")  // Check if the email format is valid
    .nonempty("Email is required"),  // Ensure email is not empty
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")  // Ensure password length is >= 6
    .nonempty("Password is required"),  // Ensure password is not empty
});