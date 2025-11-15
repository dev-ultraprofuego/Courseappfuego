'use client';
import React, { useState, useEffect } from 'react';
import AdminPage from "@/components/AdminPage";
import CourseEditorModal from '@/components/CourseEditorModal';
import { getSiteData } from '@/constants/api';
import { updateSiteDataAction } from '@/app/actions';
import type { SiteData, Course, SoftwarePill, Theme } from '@/types';

export default function AdminClientPage() {
    const [theme, setTheme] = useState<Theme>('iris');
    const [siteData, setSiteData] = useState<SiteData | null>(null);
    const [isCourseEditorOpen, setIsCourseEditorOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        getSiteData().then(data => {
            setSiteData(data);
            setIsLoading(false);
        });
    }, []);

    const handleOpenCourseEditor = (course: Course | null) => {
        setEditingCourse(course);
        setIsCourseEditorOpen(true);
    };

    const handleSave = async (): Promise<{ success: boolean; error?: string } | undefined> => {
        if (!siteData) return;
        setIsSaving(true);
        try {
            return await updateSiteDataAction(siteData);
        } catch (error) {
            console.error("Failed to save:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            alert(`Error saving data: ${errorMessage}`);
            return { success: false, error: errorMessage };
        } finally {
            setIsSaving(false);
        }
    }

    const handleSaveCourse = async (courseToSave: Course) => {
        if (!siteData) return;
        
        setIsSaving(true);
        let updatedCourses;
        const existingCourse = siteData.coursesData.find(c => c.id === courseToSave.id);

        if (existingCourse) {
            updatedCourses = siteData.coursesData.map(c => c.id === courseToSave.id ? courseToSave : c);
        } else {
            updatedCourses = [courseToSave, ...siteData.coursesData];
        }
        
        const updatedSiteData = { ...siteData, coursesData: updatedCourses };
        setSiteData(updatedSiteData);
        
        try {
            const result = await updateSiteDataAction(updatedSiteData);
            if (!result.success) {
                alert(`Error saving course: ${result.error}`);
                // Optionally revert state change if save fails
                setSiteData(siteData); 
            }
        } catch (error) {
             console.error("Failed to save course:", error);
             const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
             alert(`Error saving course: ${errorMessage}`);
             setSiteData(siteData); // Revert state
        } finally {
            setIsSaving(false);
            setIsCourseEditorOpen(false);
            setEditingCourse(null);
        }
    };

    if (isLoading || !siteData) {
        const currentTheme = theme === 'iris' ? { border: 'border-[#7de8d0]', text: 'text-[#7de8d0]' } : { border: 'border-[#ff6b81]', text: 'text-[#ff6b81]' };
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0f0e]">
                <div className={`w-16 h-16 border-4 ${currentTheme.border}/20 border-t-4 border-t-white rounded-full animate-spin`}></div>
            </div>
        );
    }

    return (
        <>
            <AdminPage 
                onLogout={() => window.location.href = '/'} 
                theme={theme} 
                onOpenCourseEditor={handleOpenCourseEditor}
                siteData={siteData}
                onDataChange={setSiteData}
                onSave={handleSave}
                isSaving={isSaving}
            />
            {isCourseEditorOpen && (
                <CourseEditorModal
                    isOpen={isCourseEditorOpen}
                    onClose={() => setIsCourseEditorOpen(false)}
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    theme={theme}
                    allCategories={siteData.softwarePillsData.filter((p): p is SoftwarePill => 'category' in p)}
                />
            )}
        </>
    );
}