import { z } from "zod";

const EDUCATIONS = ['Matric','Intermediate','Bachelor','Master'] as const;
const INTERESTED_COUNTRIES = ['Italy','UK','France','Turkey','China','Cyprus','Others'] as const;


const trimmed = (min = 1, max = 200) =>
  z.string()
    .transform((s) => s.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(min).max(max));

const emailSchema = z.string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((s) => s.trim().toLowerCase());

const phoneSchema = z.string()
    .min(1, "Phone number is required")
    .transform((s) => s.trim())
    .refine(
        (s) => /^[0-9+\-\s()]{7,20}$/.test(s),
        "Invalid phone number format"
    );

const idNullable = z.preprocess((v) => {
  if (v === '' || v == null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  return Number(v);
}, z.number().int().positive().nullable());


export const FreeConsultationSchemaSoft = z.object({
  name: trimmed(2, 80),
  email: emailSchema,
  phone_number: phoneSchema,
  last_education: z.enum(EDUCATIONS, {
    errorMap: () => ({ message: "Select a valid last education" })
  }),
  country: idNullable,
  state:   idNullable,
  city:    idNullable,

  interested_country: z.enum(INTERESTED_COUNTRIES, {
    errorMap: () => ({ message: "Select a valid interested country" })
  }),
  apply_for: trimmed(3, 120),
}).superRefine((data, ctx) => {

  if (data.state !== null && data.country === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['country'],
      message: 'Select a country before selecting a state',
    });
  }

  if (data.city !== null && data.state === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['state'],
      message: 'Select a state before selecting a city',
    });
  }
});

