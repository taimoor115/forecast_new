"use client"

const StatusSelector = ({ value, onChange }) => {
  const options = [
    { value: "-", color: "bg-white" },
    { value: "HPL", color: "bg-red-200" },
    { value: "MA", color: "bg-yellow-200" },
    { value: "VA", color: "bg-blue-200" },
    { value: "S", color: "bg-green-200" },
  ]

  const getBackgroundColor = (value) => {
    const option = options.find((opt) => opt.value === value)
    return option ? option.color : "bg-white"
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`p-1 w-full text-xs rounded border border-gray-200 ${getBackgroundColor(value)}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.value}
        </option>
      ))}
    </select>
  )
}

export default StatusSelector
