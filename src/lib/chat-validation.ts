import { z } from "zod";
export const registrationSchema = z.object({
  display_name: z.string().trim().min(1, "Enter your display name.").max(80),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});
export const messageSchema = z
  .string()
  .trim()
  .min(1, "Enter a message.")
  .max(4000, "Keep messages under 4,000 characters.");
