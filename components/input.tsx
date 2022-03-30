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
    <input
      id={normalizeSpelling(props.label)}
      name={props.name}
      className="h-full text-2xl outline-none"
      onChange={props.onChange}
      type={props.type}
      value={props.value}
      defaultValue={props.defaultValue}
    />
  </label>
);

export default Input;
