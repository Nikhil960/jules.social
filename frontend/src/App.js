import React from 'react';
import ContentCalendar from './components/ContentCalendar';
import './App.css'; // For global app styles

function App() {
  // In a real application, workspaceId would likely come from auth context, URL params, or props
  const MOCK_WORKSPACE_ID = '123'; // Replace with a dynamic ID or remove if not needed immediately

  return (
    <div className="App">
      <header className="App-header">
        <h1>Social Media Manager</h1>
      </header>
      <main className="App-main">
        <div className="nb-main-content-wrapper">
          {/* Pass the workspaceId to the ContentCalendar component */}
          {/* You might want to add a check here to ensure workspaceId is present before rendering */}
          {MOCK_WORKSPACE_ID ? (
            <ContentCalendar workspaceId={MOCK_WORKSPACE_ID} />
          ) : (
            <p>Please select a workspace to view the calendar.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;