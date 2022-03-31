const normalizeSpelling = (str) => str.split(" ").join("-").toLowerCase();
const Input = (props) => (
  <label
    htmlFor={normalizeSpelling(props.label)}
    className="
    relative
    flex
    h-12 h-auto
    flex-col
    border border-gray-100
    py-1 px-2
    focus-within:outline
    focus-within:outline-2
    focus-within:outline-green-500
    "
  >
    <span className="text-xs font-medium">{props.label}</span>
    <div className="flex items-center gap-2">
      {props.icon && <span className="text-gray-400 text-xs">{props.icon}</span>}
      <input
        id={normalizeSpelling(props.label)}
        name={props.name}
        className="h-full text-2xl outline-none"
        onChange={props.onChange}
        type={props.type}
        value={props.value}
        defaultValue={props.defaultValue}
      />
    </div>
  </label>
);

export default Input;
