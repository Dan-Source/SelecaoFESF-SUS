type SpinnerProps = {
  label?: string;
};

export function Spinner({ label = "Carregando" }: SpinnerProps) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite" aria-label={label}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}