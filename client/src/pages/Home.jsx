import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Features from "../components/Features/Features";
import About from "../components/About/About";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import AITools from "../components/AITools/AITools";
import Testimonials from "../components/Testimonials/Testimonials";
import FAQ from "../components/FAQ/FAQ";
import CTA from "../components/CTA/CTA";
import Footer from "../components/Footer/Footer";

function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <About />
            <HowItWorks />
            <AITools />
            <Testimonials />
            <FAQ />
            <CTA />
            <Footer />
        </>
    );
}

export default Home;