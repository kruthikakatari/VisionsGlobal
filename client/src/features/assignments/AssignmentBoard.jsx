import { useState } from 'react';
import AssignmentForm from './AssignmentForm.jsx';
import AssignmentList from './AssignmentList.jsx';
import AssignmentDetail from './AssignmentDetail.jsx';
import AiAssistant from './AiAssistant.jsx';
import { getCurrentUser } from '../../api/client.js';
import './assignments.css';

function AssignmentBoard() {
  const user = getCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="assignment-board">
      {user?.role === 'educator' && (
        <>
          <AiAssistant onAssigned={() => setRefreshKey((k) => k + 1)} />
          <AssignmentForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </>
      )}

      <div className="assignment-board-body">
        <AssignmentList refreshKey={refreshKey} onSelect={setSelectedId} selectedId={selectedId} />
        <AssignmentDetail assignmentId={selectedId} onChanged={() => setRefreshKey((k) => k + 1)} />
      </div>
    </div>
  );
}

export default AssignmentBoard;
