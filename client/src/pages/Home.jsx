import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Features from "../components/Features/Features";
import About from "../components/About/About";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import AITools from "../components/AITools/AITools";

function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <About />
            <HowItWorks />
            <AITools />
        </>
    );
}

export default Home;