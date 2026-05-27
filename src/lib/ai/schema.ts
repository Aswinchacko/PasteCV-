import { z } from "zod";

export const ExperienceSchema = z.object({
	company: z.string(),
	role: z.string(),
	duration: z.string(),
	points: z.array(z.string()),
});

export const ProjectSchema = z.object({
	name: z.string(),
	description: z.string(),
	url: z.string().optional(),
});

export const EducationSchema = z.object({
	institution: z.string(),
	degree: z.string(),
	year: z.string().optional(),
});

export const ContactSchema = z.object({
	email: z.string().optional(),
	linkedin: z.string().optional(),
	github: z.string().optional(),
	website: z.string().optional(),
});

export const ResumeDataSchema = z.object({
	name: z.string(),
	title: z.string(),
	summary: z.string(),
	skills: z.array(z.string()),
	experience: z.array(ExperienceSchema),
	education: z.array(EducationSchema),
	projects: z.array(ProjectSchema),
	contact: ContactSchema,
});

export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
