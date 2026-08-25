import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Search, X } from "lucide-react";
import MenuCard from "../components/MenuCard";
const Menu = () => {
  const { menus } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenus, setFilteredMenus] = useState([]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredMenus(menus);
    } else {
      const filtered = menus.filter((menu) =>
        menu.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMenus(filtered);
    }
  }, [searchQuery, menus]);
  const handleClearSearch = () => {
    setSearchQuery("");
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="public-container">
        {/* Header Section */}

        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">Made for every appetite</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Explore our <span className="font-serif italic text-orange-500">menu</span>
          </h1>{" "}
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Explore our delicious selection of handcrafted dishes made with the
            finest ingredients
          </p>
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for your favorite dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-slate-700 shadow-xl shadow-slate-900/5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            {searchQuery ? (
              <>
                Found{" "}
                <span className="font-semibold text-yellow-600">
                  {filteredMenus.length}
                </span>
                {filteredMenus.length === 1 ? " result" : " results"} for{" "}
                {searchQuery}
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-yellow-600">
                  {filteredMenus.length}
                </span>{" "}
                {filteredMenus.length === 1 ? "dish" : "dishes"}
              </>
            )}
          </p>
        </div>
        {/* Menu Grid */}
        {filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenus.map((menu) => (
              <MenuCard menu={menu} key={menu._id} />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">
              No results found for "{searchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-colors duration-300"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Menu;
