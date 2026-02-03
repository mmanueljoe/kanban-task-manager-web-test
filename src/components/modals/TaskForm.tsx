import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Dropdown } from '@components/ui/Dropdown';
import { Input } from '@components/ui/Input';
import iconCross from '@assets/icon-cross.svg';

export type TaskFormValues = {
  title: string;
  description: string;
  status: string;
  subtasks: string[];
};

type TaskFormErrors = {
  title?: string;
  description?: string;
  status?: string;
  subtasks?: string[];
  form?: string;
};

type ColumnOption = { value: string; label: string };

type TaskFormProps = {
  mode: 'create' | 'edit';
  initialValues: TaskFormValues;
  columns: ColumnOption[];
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

function validateTaskForm(
  values: TaskFormValues,
  columns: ColumnOption[]
): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const trimmedTitle = values.title.trim();
  const trimmedDescription = values.description.trim();

  if (!trimmedTitle) {
    errors.title = 'Title is required.';
  } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }

  const columnValues = new Set(columns.map((c) => c.value));
  if (!values.status) {
    errors.status = 'Status is required.';
  } else if (!columnValues.has(values.status)) {
    errors.status = 'Please choose a valid status.';
  }

  return errors;
}

export function TaskForm({
  mode,
  initialValues,
  columns,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});

  const handleChange =
    (field: keyof TaskFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setValues((prev) => ({ ...prev, [field]: nextValue }));
    };

  const handleSubtaskChange = (index: number, nextValue: string) => {
    setValues((prev) => {
      const subtasks = [...prev.subtasks];
      subtasks[index] = nextValue;
      return { ...prev, subtasks };
    });
  };

  const handleAddSubtask = () => {
    setValues((prev) => ({ ...prev, subtasks: [...prev.subtasks, ''] }));
  };

  const handleRemoveSubtask = (index: number) => {
    setValues((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleStatusChange = (nextStatus: string) => {
    setValues((prev) => ({ ...prev, status: nextStatus }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateTaskForm(values, columns);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const cleanedSubtasks = values.subtasks.map((s) => s.trim());
    const nextValues: TaskFormValues = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      subtasks: cleanedSubtasks,
    };

    setErrors({});
    onSubmit(nextValues);
  };

  const titleLength = values.title.trim().length;
  const descriptionLength = values.description.trim().length;

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-wrap" style={{ marginBottom: 16 }}>
        <Input
          id="task-title"
          label="Title"
          placeholder="e.g. Take coffee break."
          value={values.title}
          onChange={handleChange('title')}
          error={errors.title}
        />
        <div
          className="body-s"
          style={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'flex-end',
            color: 'var(--text-muted)',
          }}
        >
          {titleLength}/{MAX_TITLE_LENGTH}
        </div>
      </div>

      <div className="input-wrap" style={{ marginBottom: 16 }}>
        <label className="input-label" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          className="input"
          placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
          value={values.description}
          onChange={handleChange('description')}
          rows={3}
          style={{ resize: 'vertical', minHeight: 80 }}
          aria-invalid={errors.description ? 'true' : undefined}
        />
        <div
          className="body-s"
          style={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Optional, up to {MAX_DESCRIPTION_LENGTH} characters
            {errors.description ? ' (too long)' : ''}
          </span>
          <span>
            {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        {errors.description && (
          <span className="input-error-text" id="task-description-error">
            {errors.description}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          className="input-label"
          style={{ display: 'block', marginBottom: 8 }}
        >
          Subtasks
        </label>
        {values.subtasks.map((subtask, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Input
              id={`task-subtask-${index}`}
              placeholder={
                index === 0 ? 'e.g. Make coffee.' : 'e.g. Drink coffee & smile.'
              }
              value={subtask}
              onChange={(event) =>
                handleSubtaskChange(index, event.target.value)
              }
              className=""
            />
            <button
              type="button"
              onClick={() => handleRemoveSubtask(index)}
              aria-label="Remove subtask"
              style={{
                padding: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <img src={iconCross} alt="" width={14} height={14} />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="large"
          onClick={handleAddSubtask}
          style={{ width: '100%' }}
        >
          + Add New Subtask
        </Button>
      </div>

      <div className="input-wrap" style={{ marginBottom: 24 }}>
        <label className="input-label">Status</label>
        <Dropdown
          options={columns}
          value={values.status}
          onChange={handleStatusChange}
          placeholder="Todo"
        />
        {errors.status && (
          <span className="input-error-text">{errors.status}</span>
        )}
      </div>

      {errors.form && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid var(--destructive)',
            color: 'var(--destructive)',
          }}
        >
          {errors.form}
        </div>
      )}

      <div className="app-modal-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={onCancel}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="large"
          disabled={isSubmitting}
        >
          {mode === 'create' ? 'Create Task' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
