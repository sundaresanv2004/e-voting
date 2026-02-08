"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail } from "lucide-react"

import { BackButton } from "@/components/shared/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            fullName: "",
            email: "",
            message: "",
        },
    })

    async function onSubmit(data: ContactFormValues) {
        setIsSubmitting(true)
        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: "1e2a672e-0bdc-48b4-bfaa-f50743aa2837",
                    ...data,
                }),
            })

            const result = await response.json()
            if (result.success) {
                toast.success("Message sent!", {
                    description: "We'll get back to you shortly."
                })
                form.reset()
            } else {
                toast.error("Something went wrong.", {
                    description: "Please try again later."
                })
                console.error("Submission failed", result)
            }
        } catch (error) {
            console.error("Error submitting form", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
            {/* Background Decoration */}
            <div
                className="absolute inset-0 opacity-80 dark:opacity-60 pointer-events-none"
                style={{
                    maskImage:
                        "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60" />
            <div
                className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />

            <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                <div className="mb-8">
                    <BackButton />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6 flex flex-col justify-center h-full">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                Get in touch
                            </h1>
                            <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                                Have questions about our e-voting platform? We&#39;re here to help you set up secure, fair, and transparent elections for your organization.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="p-5 bg-card/40 border rounded-xl backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:bg-card/60 group">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base mb-0.5">Email Support</h3>
                                        <p className="text-muted-foreground text-xs mb-1">For general inquiries and technical help</p>
                                        <a href="mailto:contact@evoting.sundaresan.dev" className="text-primary font-medium hover:underline text-base">
                                            contact@evoting.sundaresan.dev
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h3 className="font-semibold mb-3 text-sm text-foreground/80">We can help you with:</h3>
                            <ul className="space-y-2">
                                {[
                                    "Setting up your first election",
                                    "Managing voter lists and eligibility",
                                    "Customizing ballot branding",
                                    "Understanding security features",
                                    "Enterprise plan details"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center text-muted-foreground text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Send us a message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we&#39;ll get back to you as soon as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <Field>
                                        <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                                        <Input
                                            id="fullName"
                                            placeholder="John Doe"
                                            {...form.register("fullName")}
                                            aria-invalid={!!form.formState.errors.fullName}
                                        />
                                        <FieldError>{form.formState.errors.fullName?.message}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            placeholder="john@example.com"
                                            {...form.register("email")}
                                            aria-invalid={!!form.formState.errors.email}
                                        />
                                        <FieldError>{form.formState.errors.email?.message}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="phone">Phone (Optional)</FieldLabel>
                                        <Input
                                            id="phone"
                                            placeholder="+1 (555) 000-0000"
                                            {...form.register("phone")}
                                            aria-invalid={!!form.formState.errors.phone}
                                        />
                                        <FieldError>{form.formState.errors.phone?.message}</FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="message">Message</FieldLabel>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us about your organization and requirements..."
                                            className="min-h-30"
                                            {...form.register("message")}
                                            aria-invalid={!!form.formState.errors.message}
                                        />
                                        <FieldError>{form.formState.errors.message?.message}</FieldError>
                                    </Field>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
