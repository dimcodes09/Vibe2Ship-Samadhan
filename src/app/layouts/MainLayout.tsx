import { Outlet } from "react-router-dom";
import { Header } from "@/shared/components/Header";
import { Footer } from "@/shared/components/Footer";
import { BackgroundPattern } from "@/shared/components/BackgroundPattern";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between">
      <BackgroundPattern />
      <Header />
      <main className="flex-1 w-full pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
