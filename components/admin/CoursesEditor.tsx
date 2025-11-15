import React, { useState, useMemo } from 'react';
import type { Course, SoftwarePill, Theme } from '@/types';
import FeatherIcon from '../FeatherIcon';

interface CoursesEditorProps {
    courses: Course[];
    allCategories: SoftwarePill[];
    onChange: (courses: Course[]) => void;
    onEditCourse: (course: Course | null) => void;
    theme: Theme;
    t: any;
    inputClass: string;
}

const CoursesEditor: React.FC<CoursesEditorProps> = ({ courses, allCategories, onChange, onEditCourse, theme, t, inputClass }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = useMemo(() => {
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courses, searchTerm]);

    const handleDelete = (courseId: number) => {
        if (window.confirm(t.confirmDeleteCourse)) {
            onChange(courses.filter(c => c.id !== courseId));
        }
    };
    
    const headerClass = `text-2xl font-bold mb-4 ${theme === 'iris' ? 'text-teal-400' : 'text-red-400'}`;
    const buttonClass = `text-white font-bold py-2 px-4 rounded transition-colors ${theme === 'iris' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-red-600 hover:bg-red-500'}`;

    return (
        <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className={headerClass}>{t.manageAllCourses}</h2>
                <button onClick={() => onEditCourse(null)} className={buttonClass}>
                    {t.addNewCourse}
                </button>
            </div>
            <input
                type="text"
                placeholder={t.searchCourses}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`mb-4 w-full ${inputClass}`}
            />
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredCourses.map(course => (
                    <div key={course.id} className="flex items-center gap-4 p-2 bg-gray-800 rounded-md">
                        <img src={course.img} alt={course.title} className="w-20 h-16 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold text-white">{course.title}</p>
                            <p className="text-xs text-gray-400">{course.date}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => onEditCourse(course)} className="p-2 text-blue-400 hover:bg-blue-900/50 rounded-full"><FeatherIcon name="edit-2" size={16} /></button>
                            <button onClick={() => handleDelete(course.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-full"><FeatherIcon name="trash-2" size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursesEditor;