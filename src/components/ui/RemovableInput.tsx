import { Input } from '@components/ui/Input';
import iconCross from '@assets/icon-cross.svg';

type RemovableInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder?: string;
};

export function RemovableInput({
  id,
  value,
  onChange,
  onRemove,
  placeholder,
}: RemovableInputProps) {
  return (
    <div className="app-removable-input">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        className="app-removable-input-btn"
      >
        <img src={iconCross} alt="" width={14} height={14} />
      </button>
    </div>
  );
}
