import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { apiClient } from '../../api/api';
import toast from 'react-hot-toast';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';

const DEFAULT_CATEGORY = { id: 'cat-1', name: 'Standard', color: '#9ca3af', price: 150 };

const TheaterForm = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', state: '', zipCode: '', phoneNumber: '',
        totalScreens: 1, isActive: true, defaultBasePrice: 150,
    });

    // Screen Configuration Mapper: { "1": {categories, layout, blocked}, "2": {...} }
    const [screensConfig, setScreensConfig] = useState({
        "1": { categories: [DEFAULT_CATEGORY], layout: [{ row: 'A', seats: 10, categoryId: 'cat-1' }], blocked: "" }
    });
    const [activeScreenTab, setActiveScreenTab] = useState("1");

    // Concessions
    const [menuItems, setMenuItems] = useState([
         { id: Date.now(), name: "Large Popcorn", description: "Freshly popped, extra butter", price: 250, icon: "🍿" }
    ]);

    useEffect(() => { if (id) loadTheater(); }, [id]);

    useEffect(() => {
        // Expand/Shrink the screensConfig mapping when totalScreens changes
        const numScreens = Math.max(1, parseInt(formData.totalScreens) || 1);
        setScreensConfig(prev => {
            const next = { ...prev };
            for(let i=1; i<=numScreens; i++) {
                if(!next[i.toString()]) next[i.toString()] = { categories: [DEFAULT_CATEGORY], layout: [{ row: 'A', seats: 10, categoryId: 'cat-1' }], blocked: "" };
            }
            return next;
        });
        if(parseInt(activeScreenTab) > numScreens) setActiveScreenTab("1");
    }, [formData.totalScreens]);

    const loadTheater = async () => {
        try {
            const data = await apiClient(`/api/theaters/${id}`, token);
            setFormData({ ...data, defaultBasePrice: data.defaultBasePrice || 150 });
            if (data.defaultSeatLayoutConfig) {
                 try {
                     const parsed = JSON.parse(data.defaultSeatLayoutConfig);
                     if (parsed["1"]) setScreensConfig(parsed);
                     else {
                         // Legacy migration: wrap old single config into screen "1"
                         const legacyMapped = {};
                         for(let i=1; i<=Math.max(1, data.totalScreens); i++) {
                             legacyMapped[i.toString()] = {
                                 categories: parsed.categories || [DEFAULT_CATEGORY],
                                 layout: parsed.layout || [{ row: 'A', seats: 10, categoryId: 'cat-1' }],
                                 blocked: Array.isArray(parsed.blocked) ? parsed.blocked.join(", ") : ""
                             };
                         }
                         setScreensConfig(legacyMapped);
                     }
                 } catch (e) {
                     console.error("Failed parsing configurations", e);
                 }
            }
            if (data.concessionsConfig) {
                 try {
                     const cConfig = JSON.parse(data.concessionsConfig);
                     if (Array.isArray(cConfig)) setMenuItems(cConfig);
                 } catch(e) {}
            }
        } catch (err) {
            toast.error('Failed to load theater');
            navigate('/admin/theaters');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setErrors({});

        try {
            // Clean up config before sending
            const sanitizedScreens = {};
            for(const [scr, conf] of Object.entries(screensConfig)) {
                if(parseInt(scr) <= formData.totalScreens) {
                    sanitizedScreens[scr] = {
                        categories: conf.categories,
                        layout: conf.layout.map(r => ({ ...r, seats: Number(r.seats) })),
                        blocked: conf.blocked ? conf.blocked.split(',').map(s=>s.trim()).filter(Boolean) : []
                    };
                }
            }

            const payload = {
                 ...formData,
                 defaultBasePrice: Number(formData.defaultBasePrice),
                 defaultSeatLayoutConfig: JSON.stringify(sanitizedScreens),
                 concessionsConfig: JSON.stringify(menuItems)
            };

            await apiClient(id ? `/api/theaters/${id}` : '/api/theaters', token, {
                method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
            });

            toast.success(id ? 'Theater updated' : 'Theater created');
            navigate('/admin/theaters');
        } catch (err) {
            toast.error(err.message || 'Failed to save theater');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    // SCREEN CONFIGURATION MUTATORS
    const updateActiveScreen = (updater) => {
        setScreensConfig(prev => ({
            ...prev,
            [activeScreenTab]: updater(prev[activeScreenTab])
        }));
    };

    //  -- Categories --
    const addCategory = () => updateActiveScreen(c => ({
        ...c,
        categories: [...c.categories, { id: `cat-${Date.now()}`, name: 'New Tier', color: '#ff5500', price: 200 }]
    }));
    const updateCategory = (id, field, value) => updateActiveScreen(c => ({
        ...c,
        categories: c.categories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat)
    }));
    const removeCategory = (id) => updateActiveScreen(c => {
         if(c.categories.length <= 1) return c;
         const newCats = c.categories.filter(cat => cat.id !== id);
         return {
             ...c,
             categories: newCats,
             layout: c.layout.map(r => r.categoryId === id ? { ...r, categoryId: newCats[0].id } : r)
         };
    });

    // -- Layout --
    const addRow = () => updateActiveScreen(c => {
        const nextChar = c.layout.length > 0 ? String.fromCharCode(c.layout[c.layout.length - 1].row.charCodeAt(0) + 1) : 'A';
        return { ...c, layout: [...c.layout, { row: nextChar, seats: 10, categoryId: c.categories[0].id }] };
    });
    const updateRow = (index, field, value) => updateActiveScreen(c => {
        const next = [...c.layout];
        next[index][field] = value;
        return { ...c, layout: next };
    });
    const removeRow = (index) => updateActiveScreen(c => {
        if(c.layout.length <= 1) return c;
        const next = [...c.layout];
        next.splice(index, 1);
        return { ...c, layout: next };
    });

    // Concession Handlers
    const handleAddMenuItem = () => setMenuItems([...menuItems, { id: Date.now(), name: "", description: "", price: 0, icon: "🍿" }]);
    const handleMenuItemChange = (id, field, value) => setMenuItems(menuItems.map(m => m.id === id ? { ...m, [field]: value } : m));
    const handleRemoveMenuItem = (id) => setMenuItems(menuItems.filter(m => m.id !== id));

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/theaters')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                        {id ? 'Edit Theater' : 'Add New Theater'}
                    </h1>
                </div>
            </div>

            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
                
                {/* General Info Card */}
                <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><Input label="Theater Name" name="name" value={formData.name} onChange={handleChange} required /></div>
                    <div className="md:col-span-2"><Input label="Address" name="address" value={formData.address} onChange={handleChange} required /></div>
                    <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
                    <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
                    <Input label="ZIP" name="zipCode" value={formData.zipCode} onChange={handleChange} maxLength={6} required />
                    <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} maxLength={10} required />
                    <Input label="Total Screens" name="totalScreens" type="number" min="1" max="15" value={formData.totalScreens} onChange={handleChange} required />
                    
                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-2 focus:ring-red-500" />
                        <label htmlFor="isActive" className="text-sm font-medium">Active Theater</label>
                    </div>
                </div>

                {/* The "Enterpise" Screen Configurator */}
                <div className="glass-card p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white">Screen Architect</h2>
                    <p className="text-gray-400 text-sm">Design the physical layouts for all screens in this theater. Showtimes will automatically inherit these maps.</p>
                    
                    {/* Screen Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4 border-b border-white/10 pb-4">
                        {Array.from({ length: formData.totalScreens }, (_, i) => (i + 1).toString()).map(scr => (
                            <button key={scr} type="button" onClick={() => setActiveScreenTab(scr)}
                                className={`px-4 py-2 rounded-md font-bold transition-all ${activeScreenTab === scr ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                Screen {scr}
                            </button>
                        ))}
                    </div>

                    {/* Active Screen Editor */}
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Categories Box inside Screen */}
                        <div className="border border-white/10 rounded-lg p-5 bg-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">Seating Tiers</h3>
                                <Button type="button" size="sm" onClick={addCategory} variant="outline" className="border-red-500 text-red-500">+ Add Tier</Button>
                            </div>
                            <div className="space-y-3">
                                {screensConfig[activeScreenTab]?.categories.map(cat => (
                                    <div key={cat.id} className="flex flex-wrap items-center gap-4 bg-black/40 p-3 rounded-md">
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="text-xs text-gray-400 block mb-1">Tier Name</label>
                                            <Input value={cat.name} onChange={(e) => updateCategory(cat.id, 'name', e.target.value)} />
                                        </div>
                                        <div className="w-24">
                                            <label className="text-xs text-gray-400 block mb-1">Color</label>
                                            <input type="color" value={cat.color} onChange={(e) => updateCategory(cat.id, 'color', e.target.value)} className="w-full h-10 rounded border border-white/10 bg-black cursor-pointer" />
                                        </div>
                                        <div className="w-32">
                                            <label className="text-xs text-gray-400 block mb-1">Price (₹)</label>
                                            <Input type="number" min="0" value={cat.price} onChange={(e) => updateCategory(cat.id, 'price', Number(e.target.value))} />
                                        </div>
                                        <Button type="button" variant="danger" size="sm" className="mt-5" onClick={() => removeCategory(cat.id)} disabled={screensConfig[activeScreenTab]?.categories.length <= 1}>X</Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Layout Box inside Screen */}
                        <div className="border border-white/10 rounded-lg p-5 bg-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">Row Blueprint</h3>
                                <Button type="button" size="sm" onClick={addRow} variant="outline" className="border-red-500 text-red-500">+ Add Row</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {screensConfig[activeScreenTab]?.layout.map((row, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-black/40 p-3 rounded-md border border-white/5">
                                        <div className="w-16">
                                            <label className="text-xs text-gray-400 block mb-1">Row</label>
                                            <Input value={row.row} onChange={(e) => updateRow(index, 'row', e.target.value.toUpperCase())} maxLength={2} />
                                        </div>
                                        <div className="w-20">
                                            <label className="text-xs text-gray-400 block mb-1">Seats</label>
                                            <Input type="number" min="1" max="50" value={row.seats} onChange={(e) => updateRow(index, 'seats', e.target.value)} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-400 block mb-1">Assign Tier</label>
                                            <select value={row.categoryId} onChange={(e) => updateRow(index, 'categoryId', e.target.value)}
                                                className="w-full h-[42px] bg-white/5 border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                                {screensConfig[activeScreenTab]?.categories.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.name} (₹{c.price})</option>)}
                                            </select>
                                        </div>
                                        <button type="button" onClick={() => removeRow(index)} disabled={screensConfig[activeScreenTab]?.layout.length <= 1} className="mt-5 text-red-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed hidden md:block">✕</button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <Input label="Blocked/Maintenance Seats (Comma separated)" placeholder="e.g. A1, A2" value={screensConfig[activeScreenTab]?.blocked || ""} onChange={e => updateActiveScreen(c => ({...c, blocked: e.target.value}))} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* F&B Concessions Card remains same */}
                <div className="glass-card p-8">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <h2 className="text-2xl font-bold">F&B Concessions</h2>
                             <p className="text-sm text-gray-400 mt-1">Design the items users can purchase before checkout at this theater.</p>
                         </div>
                         <Button type="button" size="sm" onClick={handleAddMenuItem} variant="outline" className="border-green-500 text-green-500">+ Add Item</Button>
                     </div>
                     <div className="space-y-3">
                         {menuItems.map((item) => (
                              <div key={item.id} className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                                  <div className="w-16"><label className="text-xs text-gray-400 block mb-1">Emoji</label><Input value={item.icon} onChange={(e) => handleMenuItemChange(item.id, 'icon', e.target.value)} /></div>
                                  <div className="flex-1 min-w-[150px]"><label className="text-xs text-gray-400 block mb-1">Name</label><Input value={item.name} onChange={(e) => handleMenuItemChange(item.id, 'name', e.target.value)} /></div>
                                  <div className="flex-[2] min-w-[200px]"><label className="text-xs text-gray-400 block mb-1">Description</label><Input value={item.description} onChange={(e) => handleMenuItemChange(item.id, 'description', e.target.value)} /></div>
                                  <div className="w-32"><label className="text-xs text-gray-400 block mb-1">Price (₹)</label><Input type="number" min="0" value={item.price} onChange={(e) => handleMenuItemChange(item.id, 'price', Number(e.target.value))} /></div>
                                  <Button type="button" variant="danger" size="sm" className="mt-5" onClick={() => handleRemoveMenuItem(item.id)}>Remove</Button>
                              </div>
                         ))}
                         {menuItems.length === 0 && <p className="text-gray-500 py-4">No F&B items configured.</p>}
                     </div>
                </div>

                <div className="flex gap-4 sticky bottom-6 bg-black/80 backdrop-blur pb-6 pt-4 px-4 -mx-4 rounded-xl z-50">
                    <Button type="button" variant="secondary" onClick={() => navigate('/admin/theaters')} className="flex-1">Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading} className="flex-1 flex items-center justify-center gap-2">
                        <Save className="h-5 w-5" />
                        {loading ? 'Saving...' : id ? 'Update Theater & Configs' : 'Create Theater & Mapping'}
                    </Button>
                </div>
            </motion.form>
        </div>
    );
};

export default TheaterForm;
