import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Footer from '../navigation/Footer';
import BackgroundLayer from '../common/BackgroundLayer';
import CommandPalette from '../common/CommandPalette';
import ScrollToTop from '../common/ScrollToTop';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      <ScrollToTop />

      {/* Fixed background layer — z-0 */}
      <BackgroundLayer />

      {/* Fixed Top Navigation — z-50 */}
      <Navbar />

      {/* Floating Command Palette — z-50 */}
      <CommandPalette />

      {/* Page Content — z-10 */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
