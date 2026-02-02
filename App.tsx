import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { ResourceView } from './pages/ResourceView';
import { WorkItems } from './pages/WorkItems'; 
import { ItemDetail } from './pages/ItemDetail';
import { Messages } from './pages/Messages';
import { Menu } from './pages/Menu';
import { Profile } from './pages/Profile';
import { Wiki } from './pages/Wiki';
import { Settings } from './pages/Settings';
import { AudioState, Resource, User, WorkItem } from './types';
import { DEFAULT_TRACK, MOCK_RESOURCES, MOCK_WORK_ITEMS } from './constants';

const App: React.FC = () => {
  // Load default track from local storage if exists, otherwise use constant
  const savedDefault = localStorage.getItem('app_default_track');
  
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.5,
    currentTrackUrl: savedDefault || DEFAULT_TRACK
  });

  const [hasEntered, setHasEntered] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [workItems, setWorkItems] = useState<WorkItem[]>(MOCK_WORK_ITEMS);

  const handleEnterApp = () => {
    setHasEntered(true);
    setAudioState(prev => ({ ...prev, isPlaying: true }));
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setHasEntered(false); 
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  };

  return (
    <HashRouter>
      <div className="font-sans antialiased text-gray-900 min-h-screen">
        {!hasEntered ? (
          <Landing onEnter={handleEnterApp} />
        ) : !user ? (
          <>
             <div className="fixed top-0 w-full z-50"></div>
             <Login onLoginSuccess={handleLoginSuccess} />
          </>
        ) : (
          /* Layout wraps all routes to persist AudioPlayer across navigation */
          <Layout audioState={audioState} setAudioState={setAudioState} user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={<Dashboard resources={resources} user={user} />} />
              
              <Route path="/tasks" element={<WorkItems items={workItems} setItems={setWorkItems} currentUser={user} />} />
              
              <Route path="/important" element={<WorkItems items={workItems} setItems={setWorkItems} currentUser={user} isImportantMode={true} />} />

              <Route path="/wiki" element={<Wiki />} />

              <Route path="/item/:id" element={<ItemDetail items={workItems} currentUser={user} />} />
              
              <Route path="/routine" element={<Navigate to="/tasks" replace />} />

              <Route path="/messages" element={<Messages currentUser={user} />} />

              <Route path="/menu" element={<Menu user={user} onLogout={handleLogout} />} />
              
              <Route path="/settings" element={<Settings setAudioState={setAudioState} />} />

              <Route path="/profile" element={<Profile user={user} />} />
              
              <Route path="/resource/:id" element={<ResourceView resources={resources} />} />

              <Route path="/admin" element={
                <Admin 
                   resources={resources} 
                   setResources={setResources} 
                   tasks={workItems}
                   setTasks={setWorkItems}
                   currentUser={user}
                />
              } />
            </Routes>
          </Layout>
        )}
      </div>
    </HashRouter>
  );
};

export default App;