"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useRouter } from "next/navigation";
import type { ResumeData } from "@/lib/ai/schema";
import type { TemplateId } from "@/lib/db/portfolios";

interface EditorContextValue {
	data: ResumeData;
	template: TemplateId;
	slug: string;
	isOwner: boolean;
	editMode: boolean;
	setEditMode: (v: boolean) => void;
	saving: boolean;
	isDirty: boolean;
	lastSavedAt: number | null;
	error: string | null;

	setData: (next: ResumeData) => void;
	patchData: (patch: Partial<ResumeData>) => void;
	setSkills: (skills: string[]) => void;
	setExperience: (next: ResumeData["experience"]) => void;
	setEducation: (next: ResumeData["education"]) => void;
	setProjects: (next: ResumeData["projects"]) => void;
	setContact: (next: ResumeData["contact"]) => void;

	setTemplate: (id: TemplateId) => void;
	save: () => Promise<void>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
	const ctx = useContext(EditorContext);
	if (!ctx)
		throw new Error("useEditor must be used inside <EditorProvider>");
	return ctx;
}

interface EditorProviderProps {
	slug: string;
	initialData: ResumeData;
	initialTemplate: TemplateId;
	isOwner: boolean;
	children: React.ReactNode;
}

const AUTOSAVE_DELAY_MS = 900;

export function EditorProvider({
	slug,
	initialData,
	initialTemplate,
	isOwner,
	children,
}: EditorProviderProps) {
	const router = useRouter();
	const [data, setDataState] = useState<ResumeData>(initialData);
	const [template, setTemplateState] = useState<TemplateId>(initialTemplate);
	const [editMode, setEditMode] = useState(false);
	const [saving, setSaving] = useState(false);
	const [isDirty, setDirty] = useState(false);
	const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	const savedDataRef = useRef<string>(JSON.stringify(initialData));
	const savedTemplateRef = useRef<TemplateId>(initialTemplate);
	const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const setData = useCallback((next: ResumeData) => {
		setDataState(next);
		setDirty(JSON.stringify(next) !== savedDataRef.current);
	}, []);

	const patchData = useCallback(
		(patch: Partial<ResumeData>) => {
			setData({ ...data, ...patch });
		},
		[data, setData],
	);

	const setSkills = useCallback(
		(skills: string[]) => setData({ ...data, skills }),
		[data, setData],
	);
	const setExperience = useCallback(
		(experience: ResumeData["experience"]) =>
			setData({ ...data, experience }),
		[data, setData],
	);
	const setEducation = useCallback(
		(education: ResumeData["education"]) =>
			setData({ ...data, education }),
		[data, setData],
	);
	const setProjects = useCallback(
		(projects: ResumeData["projects"]) =>
			setData({ ...data, projects }),
		[data, setData],
	);
	const setContact = useCallback(
		(contact: ResumeData["contact"]) =>
			setData({ ...data, contact }),
		[data, setData],
	);

	const save = useCallback(async () => {
		if (!isOwner) return;
		const dataChanged = JSON.stringify(data) !== savedDataRef.current;
		const templateChanged = template !== savedTemplateRef.current;
		if (!dataChanged && !templateChanged) return;

		setSaving(true);
		setError(null);
		try {
			const payload: Record<string, unknown> = {};
			if (dataChanged) payload.data = data;
			if (templateChanged) payload.template = template;

			const res = await fetch(`/api/portfolio/${slug}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error ?? `Save failed (${res.status})`);
			}

			savedDataRef.current = JSON.stringify(data);
			savedTemplateRef.current = template;
			setDirty(false);
			setLastSavedAt(Date.now());
			router.refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Save failed");
		} finally {
			setSaving(false);
		}
	}, [data, template, isOwner, slug, router]);

	const setTemplate = useCallback(
		(id: TemplateId) => {
			setTemplateState(id);
			setDirty(true);
		},
		[],
	);

	// Autosave: debounced when dirty + in edit mode.
	useEffect(() => {
		if (!isOwner) return;
		if (!isDirty) return;
		if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
		autosaveTimer.current = setTimeout(() => {
			void save();
		}, AUTOSAVE_DELAY_MS);
		return () => {
			if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
		};
	}, [isDirty, isOwner, save]);

	// Warn before unload if there's an unsaved edit.
	useEffect(() => {
		if (!isDirty) return;
		function onBeforeUnload(e: BeforeUnloadEvent) {
			e.preventDefault();
			e.returnValue = "";
		}
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, [isDirty]);

	const value = useMemo<EditorContextValue>(
		() => ({
			data,
			template,
			slug,
			isOwner,
			editMode,
			setEditMode,
			saving,
			isDirty,
			lastSavedAt,
			error,
			setData,
			patchData,
			setSkills,
			setExperience,
			setEducation,
			setProjects,
			setContact,
			setTemplate,
			save,
		}),
		[
			data,
			template,
			slug,
			isOwner,
			editMode,
			saving,
			isDirty,
			lastSavedAt,
			error,
			setData,
			patchData,
			setSkills,
			setExperience,
			setEducation,
			setProjects,
			setContact,
			setTemplate,
			save,
		],
	);

	return (
		<EditorContext.Provider value={value}>{children}</EditorContext.Provider>
	);
}
