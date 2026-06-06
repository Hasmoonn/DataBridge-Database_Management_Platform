import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, Edit, Search, Trash2 } from 'lucide-react';
import { useConnections } from '../../hooks/useConnections';
import PageHeader from '../../components/common/PageHeader';
import ConnectionForm from '../../components/connections/ConnectionForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const ConnectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    connections,
    loading,
    updateConnection,
    deleteConnection,
    testConnection,
  } = useConnections();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);

  const connection = connections.find((c) => String(c.id) === String(id));

  const handleUpdate = async (data) => {
    const result = await updateConnection(id, data);
    if (result.success) {
      navigate('/connections');
    }
    return result;
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteConnection(id);
    setDeleting(false);
    if (result.success) {
      navigate('/connections');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    await testConnection(id);
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="text-center py-20">
        <p className="text-[#e5e5e5]/60">Connection not found.</p>
        <button
          className="mt-4 text-[#fca311] hover:underline text-sm"
          onClick={() => navigate('/connections')}
        >
          Back to connections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={connection.name}
        subtitle={`${connection.host}:${connection.port}`}
        breadcrumbs={[
          { label: 'Connections', href: '/connections' },
          { label: connection.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleTest}
              loading={testing}
            >
              <Zap size={15} className="mr-1.5" />
              Test
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/explorer?connection=${id}`)}
            >
              <Search size={15} className="mr-1.5" />
              Explore
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={15} className="mr-1.5" />
              Delete
            </Button>
          </div>
        }
      />

      <ConnectionForm
        initialData={connection}
        onSubmit={handleUpdate}
        onTest={() => handleTest()}
        onCancel={() => navigate('/connections')}
        isEdit
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Connection"
        description={`Delete "${connection.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ConnectionDetailPage;