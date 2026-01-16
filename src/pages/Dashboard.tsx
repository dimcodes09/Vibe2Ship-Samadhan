import { Header } from "@/components/layout/Header";
import { IssuesNearYou } from "@/components/sections/IssuesNearYou";
import { Footer } from "@/components/sections/Footer";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <IssuesNearYou />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
