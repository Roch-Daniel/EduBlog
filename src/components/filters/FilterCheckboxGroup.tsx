import type { IFilterCheckboxGroupProps } from "../../interfaces/IPostFilters";

export default function FilterCheckboxGroup({
  legend,
  options,
  selected,
  onToggle,
}: IFilterCheckboxGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-bold text-slate-900">{legend}</legend>

      <div className="mt-2 flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="h-4 w-4 cursor-pointer accent-teal-700 scheme-light"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
