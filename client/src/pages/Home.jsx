import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Features from "../components/Features/Features";
import About from "../components/About/About";

function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <About />
        </>
    );
}

export default Home;