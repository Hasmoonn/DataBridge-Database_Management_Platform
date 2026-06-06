import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnections } from '../../hooks/useConnections';
import PageHeader from '../../components/common/PageHeader';
import ConnectionForm from '../../components/connections/ConnectionForm';

const NewConnectionPage = () => {
  const navigate = useNavigate();
  const { createConnection, testConnection } = useConnections();

  const handleSubmit = async (data) => {
    const result = await createConnection(data);
    if (result.success) {
      navigate('/connections');
    }
    return result;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Add Connection"
        subtitle="Connect to a new database"
        breadcrumbs={[
          { label: 'Connections', href: '/connections' },
          { label: 'New Connection' },
        ]}
      />
      <ConnectionForm
        onSubmit={handleSubmit}
        onTest={testConnection}
        onCancel={() => navigate('/connections')}
      />
    </div>
  );
};

export default NewConnectionPage;