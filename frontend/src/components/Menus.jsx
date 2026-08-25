import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AppContext } from "../context/AppContext";
import MenuCard from "./MenuCard";
const Menus = () => { const { menus } = useContext(AppContext); return <section className="bg-slate-50 py-20"><div className="public-container"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">From our kitchen</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Popular on the <span className="font-serif italic text-orange-500">menu</span></h2><p className="mt-4 max-w-xl leading-7 text-slate-500">Handcrafted dishes prepared with quality ingredients and care.</p></div><Link to="/menu" className="inline-flex items-center gap-2 font-bold text-orange-600">View full menu<ArrowRight size={17}/></Link></div>{menus.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{menus.slice(0,8).map((menu) => <MenuCard key={menu._id} menu={menu}/>)}</div> : <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-96 animate-pulse rounded-[1.75rem] bg-slate-200"/>)}</div>}</div></section>; };
export default Menus;
