import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Composants
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import EtablissementList from './components/Etablissements/EtablissementList';
import EtablissementForm from './components/Etablissements/EtablissementForm';
import KitList from './components/Kits/KitList';
import KitForm from './components/Kits/KitForm';
import DistributionList from './components/Distributions/DistributionList';
import DistributionForm from './components/Distributions/DistributionForm';
import Layout from './components/Layout/Layout';
import ChatBot from './components/Chat/ChatBot';

// Route protégée
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

function AppRoutes() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/etablissements" element={
                    <ProtectedRoute>
                        <Layout>
                            <EtablissementList />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/etablissements/nouveau" element={
                    <ProtectedRoute>
                        <Layout>
                            <EtablissementForm />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/etablissements/modifier/:code" element={
                    <ProtectedRoute>
                        <Layout>
                            <EtablissementForm />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/kits" element={
                    <ProtectedRoute>
                        <Layout>
                            <KitList />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/kits/nouveau" element={
                    <ProtectedRoute>
                        <Layout>
                            <KitForm />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/kits/modifier/:id" element={
                    <ProtectedRoute>
                        <Layout>
                            <KitForm />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/distributions" element={
                    <ProtectedRoute>
                        <Layout>
                            <DistributionList />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/distributions/nouveau" element={
                    <ProtectedRoute>
                        <Layout>
                            <DistributionForm />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/distributions/modifier/:id" element={
                    <ProtectedRoute>
                        <Layout>
                            <DistributionForm />
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>

            {/* Bouton pour ouvrir le chat - toujours visible */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <span className="text-xl">💬</span>
                </button>
            )}

            {/* ChatBot */}
            {isChatOpen && (
                <ChatBot 
                    isOpen={isChatOpen} 
                    onClose={() => setIsChatOpen(false)} 
                />
            )}

            <Toaster position="top-right" />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;