import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthProvider from "@/providers/AuthProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F9FA] overflow-hidden">
        <AuthProvider>
          <div className="flex h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 ml-[280px]">
              <Header />
              <main className="flex-1 overflow-y-auto pt-16">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}