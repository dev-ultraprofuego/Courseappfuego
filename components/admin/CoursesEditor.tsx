
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
    onDelete?: (id: number) => void;
}

const CoursesEditor: React.FC<CoursesEditorProps> = ({ courses, allCategories, onChange, onEditCourse, theme, t, inputClass, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || course.categories.includes(categoryFilter);
            return matchesSearch && matchesCategory;
        });
    }, [courses, searchTerm, categoryFilter]);

    const handleDelete = (courseId: number) => {
        // Directly call onDelete prop. The parent component (AdminPage) handles the Confirmation Modal.
        if (onDelete) {
            onDelete(courseId);
        } else {
            // Fallback if soft delete is not enabled (should not happen in this setup)
            onChange(courses.filter(c => c.id !== courseId));
        }
    };
    
    const headerClass = `text-xl font-bold text-white`;
    
    // Theme-specific glow color
    const glowColor = theme === 'iris' ? "rgba(45,212,191,0.6)" : (theme === 'pristine' ? "rgba(255,71,87,0.6)" : "rgba(217,38,38,0.6)");

    // Table Styles
    const tableHeaderStyle = "text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3 text-left select-none";
    const rowStyle = "group border-b border-white/5 hover:bg-white/[0.02] transition-colors";
    const cellStyle = "px-4 py-3 text-sm text-gray-300 align-middle";

    return (
        <div className="bg-[#0a0d0c] border border-white/5 p-0 rounded-xl flex flex-col">
            
            {/* Toolbar */}
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className={headerClass}>{t.manageAllCourses}</h2>
                    <p className="text-xs text-gray-500 mt-1">{courses.length} {t.itemsInDatabase}</p>
                </div>
                <button 
                    onClick={() => onEditCourse(null)} 
                    className="group relative flex items-center gap-2 bg-gradient-to-b from-[#161a19] to-[#0a0d0c] text-white font-bold py-2 px-5 rounded-lg border border-white/10 transition-all duration-300 hover:bg-[#131615] hover:border-white/20 font-heading text-xs uppercase tracking-wide"
                    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px ${glowColor}` }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)' }}
                >
                    <FeatherIcon name="plus-circle" size={14} />
                    {t.addNewCourse}
                </button>
            </div>
            
            {/* Filters */}
            <div className="p-4 bg-[#0E1110] border-b border-white/5 flex gap-3">
                <div className="relative flex-1 max-w-md">
                    <FeatherIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder={t.searchCourses}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`${inputClass} pl-9 py-2 text-xs h-9`}
                    />
                </div>
                <div className="relative w-48">
                     <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={`${inputClass} py-2 text-xs h-9 appearance-none cursor-pointer`}
                    >
                        <option value="all">{t.coursesTable.filterAll}</option>
                        {allCategories.map(cat => (
                            <option key={cat.category} value={cat.category}>{cat.name}</option>
                        ))}
                    </select>
                    <FeatherIcon name="filter" size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#0a0d0c]">
                <table className="w-full border-collapse">
                    <thead className="bg-[#0a0d0c] shadow-sm">
                        <tr>
                            <th className={`${tableHeaderStyle} w-16 pl-6`}>{t.coursesTable.image}</th>
                            <th className={tableHeaderStyle}>{t.coursesTable.title}</th>
                            <th className={`${tableHeaderStyle} w-24`}>{t.coursesTable.status}</th>
                            <th className={`${tableHeaderStyle} w-1/4`}>{t.coursesTable.categories}</th>
                            <th className={`${tableHeaderStyle} w-32`}>{t.coursesTable.date}</th>
                            <th className={`${tableHeaderStyle} w-20 text-right pr-6`}>{t.coursesTable.action}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map(course => (
                                <tr key={course.id} className={rowStyle}>
                                    <td className={`${cellStyle} pl-6`}>
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-[#1A1D1C] border border-white/10 relative">
                                            {course.img ? (
                                                <img src={course.img} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    <FeatherIcon name="image" size={14}/>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className={cellStyle}>
                                        <span className="font-semibold text-white block truncate max-w-[300px]" title={course.title}>{course.title}</span>
                                        <span className="text-[10px] text-gray-600 font-mono truncate block max-w-[300px]">ID: {course.id}</span>
                                    </td>
                                    <td className={cellStyle}>
                                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${course.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                            {course.status === 'draft' ? t.coursesTable.draft : t.coursesTable.published}
                                        </span>
                                    </td>
                                    <td className={cellStyle}>
                                        <div className="flex flex-wrap gap-1.5">
                                            {course.categories.slice(0, 3).map(cat => (
                                                <span key={cat} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#151918] text-gray-400 border border-white/10 whitespace-nowrap capitalize">
                                                    {cat}
                                                </span>
                                            ))}
                                            {course.categories.length > 3 && (
                                                <span className="text-[9px] text-gray-600 py-0.5">+ {course.categories.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={cellStyle}>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{course.date}</span>
                                    </td>
                                    <td className={`${cellStyle} text-right pr-6`}>
                                        <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onEditCourse(course)} 
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                            >
                                                <FeatherIcon name="edit-2" size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(course.id)} 
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                            >
                                                <FeatherIcon name="trash-2" size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-600">
                                        <div className="w-16 h-16 bg-[#111413] rounded-full flex items-center justify-center mb-4 border border-white/5">
                                            <FeatherIcon name="search" size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400">{t.coursesTable.noCourses}</p>
                                        <p className="text-xs mt-1 text-gray-600">{t.coursesTable.tryFilter}</p>
                                        <button onClick={() => onEditCourse(null)} className="mt-4 text-xs text-blue-400 hover:text-blue-300 hover:underline">
                                            {t.manager.createCourse}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoursesEditor;
