import Navbar from '@/components/home/Navbar'
import HeroSection from '@/components/home/HeroSection'
import TrustStrip from '@/components/home/TrustStrip'
import StatsSection from '@/components/home/StatsSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedJobs from '@/components/home/FeaturedJobs'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import CTABanner from '@/components/home/CTABanner'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-page font-body">
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <StatsSection />
      <CategoriesSection />
      <FeaturedJobs />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  )
}
