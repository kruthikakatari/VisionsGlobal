import { useState } from 'react';
import ContentForm from './ContentForm.jsx';
import ContentList from './ContentList.jsx';
import './content.css';

function ContentLibrary() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="content-library">
      <ContentForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <ContentList refreshKey={refreshKey} />
    </div>
  );
}

export default ContentLibrary;
