import type { ChangeEvent } from 'react'

export type SelectOption<TValue extends string> = Readonly<{
  value: TValue
  label: string
}>

type SelectBoxProps<TValue extends string> = Readonly<{
  id: string
  label: string
  value: TValue
  options: readonly SelectOption<TValue>[]
  onChange: (value: TValue) => void
  wrapperClassName?: string
}>

export const SelectBox = <TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  wrapperClassName,
}: SelectBoxProps<TValue>) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find((option) => option.value === event.target.value)
    if (selectedOption != null) {
      onChange(selectedOption.value)
    }
  }

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
