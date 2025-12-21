import Footer from "./components/layout/footer";
import Header from "./components/layout/header"
import NasdaqSection from "./components/sections/nasdaq";

export default function Home() {
  return (
    <main>
      <Header />
      <NasdaqSection />
      <Footer />
    </main>
  );
}
