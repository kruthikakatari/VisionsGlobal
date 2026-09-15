import { useState } from 'react';
import ContentForm from './ContentForm.jsx';
import ContentList from './ContentList.jsx';
import { getCurrentUser } from '../../api/client.js';
import './content.css';

function ContentLibrary() {
  const user = getCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="content-library">
      {user?.role === 'educator' && <ContentForm onCreated={() => setRefreshKey((k) => k + 1)} />}
      <ContentList refreshKey={refreshKey} />
    </div>
  );
}

export default ContentLibrary;
