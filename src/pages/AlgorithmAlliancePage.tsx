import React from 'react';
import Enhanced3DSpiralAnimation from '../components/Enhanced3DSpiralAnimation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AlgorithmAlliancePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-grow flex flex-col h-[calc(100vh-64px)] relative overflow-hidden">
        <Enhanced3DSpiralAnimation />
      </main>
      <Footer />
    </div>
  );
};

export default AlgorithmAlliancePage;
