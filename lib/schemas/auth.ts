import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(1, "Password is required.")
})

export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions."
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
})

export const verifySchema = z.object({
    code: z.string().length(6, "Please enter the 6-digit code."),
})
