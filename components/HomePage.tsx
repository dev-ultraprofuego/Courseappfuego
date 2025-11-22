
// Fix: Import React to fix JSX syntax errors.
import React from 'react';
import Hero from './Hero';
import SoftwarePills from './SoftwarePills';
import CourseCarousel from './CourseCarousel';
import WallofLove from './WallofLove';
import FAQ from './FAQ';
import type { HomePageProps } from '../types';

// Fix: Removed onNavigate from props as it is no longer used.
const HomePage: React.FC<HomePageProps> = ({ data, theme }) => {

    return (
        <>
            {/* Fix: Removed onNavigate prop */}
            <Hero theme={theme} config={data.config} />
            {/* Fix: Removed onNavigate prop, Added categoryCourseLinks */}
            <SoftwarePills theme={theme} pills={data.softwarePillsData} courses={data.coursesData} categoryCourseLinks={data.categoryCourseLinks} />
            
            {data.homepageSections.map(section => (
                <CourseCarousel 
                    key={section.id}
                    // Fix: Removed onNavigate prop
                    theme={theme} 
                    section={section}
                    allCourses={data.coursesData}
                    pills={data.softwarePillsData}
                    config={data.config}
                />
            ))}

            <WallofLove theme={theme} testimonials={data.testimonials} />
            <FAQ theme={theme} faqItems={data.faqData} />
        </>
    );
};

export default HomePage;
