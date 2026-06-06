import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Play, Database } from 'lucide-react';
import { useConnections } from '../../hooks/useConnections';
import { useDiscovery } from '../../hooks/useDiscovery';
import { useTransfers } from '../../hooks/useTransfers';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toggle from '../../components/common/Toggle';
import clsx from 'clsx';

const STEPS = [
  { id: 1, label: 'Source' },
  { id: 2, label: 'Destination' },
  { id: 3, label: 'Mapping' },
  { id: 4, label: 'Review' },
];

const NewTransferPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connections } = useConnections();
  const { createTransfer } = useTransfers();
  const sourceDiscovery = useDiscovery();
  const destDiscovery = useDiscovery();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    source_connection: searchParams.get('source_conn') || '',
    source_schema: searchParams.get('source_schema') || '',
    source_table: searchParams.get('source_table') || '',
    destination_connection: '',
    destination_schema: '',
    destination_table: '',
    column_mapping: {},
    source_filters: {},
    batch_size: 1000,
    truncate_destination: false,
  });

  // Load source schemas
  useEffect(() => {
    if (form.source_connection)
      sourceDiscovery.fetchSchemas(form.source_connection);
  }, [form.source_connection]);

  useEffect(() => {
    if (form.source_connection && form.source_schema)
      sourceDiscovery.fetchTables(form.source_connection, form.source_schema);
  }, [form.source_connection, form.source_schema]);

  useEffect(() => {
    if (form.source_connection && form.source_schema && form.source_table)
      sourceDiscovery.fetchColumns(
        form.source_connection,
        form.source_schema,
        form.source_table
      );
  }, [form.source_connection, form.source_schema, form.source_table]);

  // Load destination
  useEffect(() => {
    if (form.destination_connection)
      destDiscovery.fetchSchemas(form.destination_connection);
  }, [form.destination_connection]);

  useEffect(() => {
    if (form.destination_connection && form.destination_schema)
      destDiscovery.fetchTables(
        form.destination_connection,
        form.destination_schema
      );
  }, [form.destination_connection, form.destination_schema]);

  useEffect(() => {
    if (
      form.destination_connection &&
      form.destination_schema &&
      form.destination_table
    )
      destDiscovery.fetchColumns(
        form.destination_connection,
        form.destination_schema,
        form.destination_table
      );
  }, [
    form.destination_connection,
    form.destination_schema,
    form.destination_table,
  ]);

  // Auto-populate name
  useEffect(() => {
    if (
      !form.name &&
      form.source_table &&
      form.destination_table
    ) {
      setForm((p) => ({
        ...p,
        name: `${form.source_table} → ${form.destination_table}`,
      }));
    }
  }, [form.source_table, form.destination_table]);

  // Auto column mapping
  useEffect(() => {
    if (
      step === 3 &&
      sourceDiscovery.columns.length > 0 &&
      destDiscovery.columns.length > 0 &&
      Object.keys(form.column_mapping).length === 0
    ) {
      const mapping = {};
      sourceDiscovery.columns.forEach((sc) => {
        const match = destDiscovery.columns.find(
          (dc) => dc.column_name === sc.column_name
        );
        if (match) mapping[sc.column_name] = match.column_name;
      });
      setForm((p) => ({ ...p, column_mapping: mapping }));
    }
  }, [step, sourceDiscovery.columns, destDiscovery.columns]);

  const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const canProceed = () => {
    if (step === 1)
      return (
        form.source_connection && form.source_schema && form.source_table
      );
    if (step === 2)
      return (
        form.destination_connection &&
        form.destination_schema &&
        form.destination_table
      );
    if (step === 3) return Object.keys(form.column_mapping).length > 0;
    return form.name.trim().length > 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await createTransfer({
      ...form,
      source_connection: Number(form.source_connection),
      destination_connection: Number(form.destination_connection),
    });
    setLoading(false);
    if (result.success) navigate(`/transfers/${result.data.id}`);
  };

  const connOpts = connections.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="New Transfer"
        subtitle="Configure a new data transfer job"
        breadcrumbs={[
          { label: 'Transfers', href: '/transfers' },
          { label: 'New Transfer' },
        ]}
      />

      {/* Stepper */}
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center min-w-[3rem]">
                <div
                  className={clsx(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all',
                    step === s.id
                      ? 'bg-[#fca311] text-black'
                      : step > s.id
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-white/8 text-white/40 border border-white/12'
                  )}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span
                  className={clsx(
                    'text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium text-center',
                    step === s.id ? 'text-white' : 'text-[#e5e5e5]/50'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-1 sm:mx-2 transition-colors min-w-[0.5rem]',
                    step > s.id ? 'bg-[#22c55e]' : 'bg-white/8'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 min-h-[320px]">
          {step === 1 && (
            <StepSource
              form={form}
              update={updateForm}
              connections={connOpts}
              discovery={sourceDiscovery}
            />
          )}
          {step === 2 && (
            <StepDestination
              form={form}
              update={updateForm}
              connections={connOpts}
              discovery={destDiscovery}
            />
          )}
          {step === 3 && (
            <StepMapping
              form={form}
              update={updateForm}
              sourceColumns={sourceDiscovery.columns}
              destColumns={destDiscovery.columns}
            />
          )}
          {step === 4 && <StepReview form={form} />}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 sm:mt-8 pt-5 border-t border-white/8">
          <Button
            variant="outline"
            onClick={() => (step === 1 ? navigate('/transfers') : setStep(step - 1))}
            className="w-full sm:w-auto"
          >
            <ArrowLeft size={15} className="mr-1.5" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="w-full sm:w-auto">
              Next <ArrowRight size={15} className="ml-1.5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading} disabled={!canProceed()} className="w-full sm:w-auto">
              <Play size={15} className="mr-1.5" />
              Create Transfer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const StepSource = ({ form, update, connections, discovery }) => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold text-white">Select Source</h3>
    <Select
      label="Source Connection"
      options={connections}
      value={form.source_connection}
      onChange={(e) => update('source_connection', e.target.value)}
      placeholder="Choose a connection"
    />
    {form.source_connection && (
      <Select
        label="Source Schema"
        options={discovery.schemas.map((s) => ({
          value: s.schema_name,
          label: s.schema_name,
        }))}
        value={form.source_schema}
        onChange={(e) => update('source_schema', e.target.value)}
        placeholder="Choose a schema"
      />
    )}
    {form.source_schema && (
      <Select
        label="Source Table"
        options={discovery.tables.map((t) => ({
          value: t.table_name,
          label: `${t.table_name} (${t.estimated_rows} rows)`,
        }))}
        value={form.source_table}
        onChange={(e) => update('source_table', e.target.value)}
        placeholder="Choose a table"
      />
    )}
  </div>
);

const StepDestination = ({ form, update, connections, discovery }) => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold text-white">Select Destination</h3>
    <Select
      label="Destination Connection"
      options={connections}
      value={form.destination_connection}
      onChange={(e) => update('destination_connection', e.target.value)}
      placeholder="Choose a connection"
    />
    {form.destination_connection && (
      <Select
        label="Destination Schema"
        options={discovery.schemas.map((s) => ({
          value: s.schema_name,
          label: s.schema_name,
        }))}
        value={form.destination_schema}
        onChange={(e) => update('destination_schema', e.target.value)}
        placeholder="Choose a schema"
      />
    )}
    {form.destination_schema && (
      <Select
        label="Destination Table"
        options={discovery.tables.map((t) => ({
          value: t.table_name,
          label: t.table_name,
        }))}
        value={form.destination_table}
        onChange={(e) => update('destination_table', e.target.value)}
        placeholder="Choose a table"
      />
    )}
    <div className="pt-3">
      <Toggle
        enabled={form.truncate_destination}
        onChange={(v) => update('truncate_destination', v)}
        label="Truncate destination before transfer"
        description="Delete all existing data from destination table"
      />
    </div>
  </div>
);

const StepMapping = ({ sourceColumns, destColumns, form, update }) => {
  const handleMapChange = (srcCol, destCol) => {
    const newMap = { ...form.column_mapping };
    if (destCol === '') delete newMap[srcCol];
    else newMap[srcCol] = destCol;
    update('column_mapping', newMap);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Column Mapping</h3>
      <p className="text-xs text-[#e5e5e5]/60">
        Map source columns to destination columns. Unmapped columns will be skipped.
      </p>
      <div className="bg-black/30 rounded-lg border border-white/8 max-h-96 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#0a0e1f]">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase text-[#fca311] tracking-wider">
                Source Column
              </th>
              <th className="px-3 py-2 text-center text-xs text-[#fca311]">→</th>
              <th className="px-3 py-2 text-left text-xs uppercase text-[#fca311] tracking-wider">
                Destination Column
              </th>
            </tr>
          </thead>
          <tbody>
            {sourceColumns.map((sc) => (
              <tr key={sc.column_name} className="border-t border-white/5">
                <td className="px-3 py-2 text-xs font-mono text-white">
                  {sc.column_name}
                  <span className="ml-2 text-[10px] text-[#7dd3fc]">
                    {sc.data_type}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-[#fca311]">→</td>
                <td className="px-3 py-2">
                  <select
                    value={form.column_mapping[sc.column_name] || ''}
                    onChange={(e) => handleMapChange(sc.column_name, e.target.value)}
                    className="w-full text-xs bg-black/40 border border-white/8 rounded px-2 py-1 text-white focus:outline-none focus:border-[#fca311]/50"
                  >
                    <option value="" className="bg-[#14213d]">
                      — Skip —
                    </option>
                    {destColumns.map((dc) => (
                      <option
                        key={dc.column_name}
                        value={dc.column_name}
                        className="bg-[#14213d]"
                      >
                        {dc.column_name} ({dc.data_type})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#fca311]">
        {Object.keys(form.column_mapping).length} of {sourceColumns.length} columns mapped
      </p>
    </div>
  );
};

const StepReview = ({ form }) => (
  <div className="space-y-4">
    <Input
      label="Transfer Name *"
      value={form.name}
      onChange={(e) => form.name && form.name !== e.target.value && (form.name = e.target.value)}
    />
    <div className="bg-black/30 border border-white/8 rounded-lg p-4 space-y-3">
      <Row label="Source" value={`${form.source_schema}.${form.source_table}`} />
      <Row
        label="Destination"
        value={`${form.destination_schema}.${form.destination_table}`}
      />
      <Row label="Batch Size" value={form.batch_size} />
      <Row label="Columns Mapped" value={Object.keys(form.column_mapping).length} />
      <Row
        label="Truncate Destination"
        value={form.truncate_destination ? 'Yes' : 'No'}
      />
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[#e5e5e5]/60">{label}</span>
    <span className="text-white font-mono">{value}</span>
  </div>
);

export default NewTransferPage;