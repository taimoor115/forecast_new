const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2 ">
      {label && <span className="text-sm">{label}</span>}
      <label className="relative inline-block w-10 h-5">
        <input
          type="checkbox"
          className="w-0 h-0 opacity-0"
          checked={checked}
          onChange={onChange}
        />
        <span
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
            checked ? "bg-custom_blue" : "bg-slate-400"
          }`}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-white transition-all duration-300 ${
              checked ? "left-[calc(100%-1.15rem)]" : "left-0.5"
            } top-0.5`}
          />
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
