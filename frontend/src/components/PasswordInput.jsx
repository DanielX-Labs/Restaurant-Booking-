import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const PasswordInput = ({ className = "", wrapperClassName = "", ...props }) => { const [visible, setVisible] = useState(false); return <span className={`relative block ${wrapperClassName}`}><input {...props} type={visible ? "text" : "password"} className={`${className} pr-12`}/><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span>; };
export default PasswordInput;
