import "../landing.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import Courses from "../components/Courses";
import HowItWorks from "../components/HowItWorks";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Courses />
      <HowItWorks />
      <About />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
