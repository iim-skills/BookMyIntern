import CVUploadCTA from './section/CVUploadCTA';
import HeroSection from './section/heroSec';
import HowItWorks from './section/HowItWorks';
import JobCategories from './section/JobCategories';
import RecentJobs from './section/RecentJobs';
import EmployerCTA from './section/employerCTA';
import TestimonialSection from './section/ReviewSec';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <JobCategories />
      <CVUploadCTA />
      <RecentJobs />
      <EmployerCTA />
      <TestimonialSection />
    </>
  );
}