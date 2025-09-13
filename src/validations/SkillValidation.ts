import z from "zod";

export const EditJobOpportunitiesSchema = z.object({
  title: z.string().min(5, "Please enter a valid title").max(191, "Title cannot exceed 191 characters"),
  job_type: z.string().min(5, "Please enter a valid job type").max(191, "Job type cannot exceed 191 characters"),
  city: z.string().max(191, "City cannot exceed 191 characters"),
  province: z.string().max(191, "Province cannot exceed 191 characters"),
  country: z.string().max(191, "Country cannot exceed 191 characters"),
  site_based: z.boolean().optional().transform(val => val ? 1 : 0), // Transform to 1 or 0
  skills: z.union([
    z.string().max(191, "Skills cannot exceed 191 characters"),
    z.array(z.string()).max(191, "Skills array cannot exceed 191 characters in each item")
  ]).transform(skills => Array.isArray(skills) ? skills.join(',') : skills),
  experience: z.string().max(191, "Experience cannot exceed 191 characters"),
  requirements: z.string().min(5, "Please enter a valid Requirements"),
  responsibilities: z.string().min(5, "Please enter a valid Responsibilities"),
  description: z.string().min(5, "Please enter a valid Description"),
  active: z.union([
    z.boolean().transform(val => (val ? 1 : 0)),
    z.number().min(0, "Active must be 0 or greater")
  ]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});