import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
})

export const RegisterSchema = z.object({
  name: z.string().min(3, {
    message: "Valid name is required",
  }),
  email: z.string().email({
    message: "Valid email is required",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
})

export const SignupSchema = RegisterSchema.extend({
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
