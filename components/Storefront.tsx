import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Product, CompanyDetails } from '../types';

// Initialize Supabase Client
const SUPABASE_URL = "https://vmjposgabkrrlszpppba.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtanBvc2dhYmtycmxzenBwcGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4Mzc5MDgsImV4cCI6MjA5NjQxMzkwOH0.RrQIAAWX3MI_JdDv-Bkk6I5ARmR7uw5tt9wrvq6pO74";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
    name: "My Store",
    tagline: "",
    sloganMalayalam: "വിളിക്കൂ... വീട്ടിലെത്തിക്കാം",
    address: "Omassery, Calicut",
    phone: "+919562496164", 
    deliveryCharge: 20,
    freeDeliveryOver: 150,
    currencySymbol: "₹",
    logoUrl: "" 
};

const DEFAULT_PRODUCTS: Product[] = [
    {
        id: "1",
        nameEnglish: "Pathiri",
        nameMalayalam: "പത്തിരി",
        price: 4,
        imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
        category: "Breads",
        preparationTime: "10 mins",
        deliveryDetails: "Delivered fresh & hot in food-grade wrapping.",
        description: "Traditional soft, paper-thin rice pancakes perfect with delicious curries."
    },
    {
        id: "2",
        nameEnglish: "Vellayappam",
        nameMalayalam: "വെള്ളയപ്പം",
        price: 6,
        imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400",
        category: "Breads",
        preparationTime: "10 mins",
        deliveryDetails: "Best consumed within 4 hours.",
        description: "Spongy, fermented rice and coconut hoppers with crispy laced edges."
    },
    {
        id: "3",
        nameEnglish: "Chappathi",
        nameMalayalam: "ചപ്പാത്തി",
        price: 5,
        imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400",
        category: "Breads",
        preparationTime: "15 mins",
        deliveryDetails: "Standard thermal delivery packing.",
        description: "Whole wheat hand-rolled soft chappathis made with high-quality grains."
    },
    {
        id: "4",
        nameEnglish: "Noolputtu",
        nameMalayalam: "നൂൽപുട്ട്",
        price: 6,
        imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=400",
        category: "Breads",
        preparationTime: "12 mins",
        deliveryDetails: "Steamed and packed directly from kitchen counters.",
        description: "Delicate string hoppers made of steamed rice flour pressed into noodles."
    },
    {
        id: "5",
        nameEnglish: "Idli",
        nameMalayalam: "ഇഡ്ഡലി",
        price: 6,
        imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400",
        category: "Breakfast",
        preparationTime: "10 mins",
        deliveryDetails: "Shipped with complimentary green chutney.",
        description: "Savory steamed cakes made of fermented black lentils and rice."
    },
    {
        id: "6",
        nameEnglish: "Porotta",
        nameMalayalam: "പൊറോട്ട",
        price: 12,
        imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
        category: "Breads",
        preparationTime: "15 mins",
        deliveryDetails: "Wrapped in protective thermal insulation.",
        description: "Layered, flaky flatbread made from refined flour, perfectly kneaded and beaten."
    }
];

export default function Storefront() {
    const [company, setCompany] = useState(() => {
        const saved = localStorage.getItem("eatsee_company");
        return saved ? JSON.parse(saved) : DEFAULT_COMPANY_DETAILS;
    });

    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem("eatsee_products");
        return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState("menu"); 
    const [showFlyerModal, setShowFlyerModal] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
        nameEnglish: "",
        nameMalayalam: "",
        price: 0,
        imageUrl: "",
        category: "",
        preparationTime: "",
        deliveryDetails: "",
        description: ""
    });
    
    // Administrative Portal States
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem("eatsee_isAdmin") === "true";
    });

    const [toast, setToast] = useState<{message: string, type: string} | null>(null);

    // Customer Form Fields
    const [orderForm, setOrderForm] = useState({
        customerName: "",
        quantity: 10,
        deliveryType: "delivery", 
        location: "",
        landmark: "",
        deliveryTime: "ASAP",
        notes: ""
    });

    // Admin Editable States
    const [adminCompany, setAdminCompany] = useState<CompanyDetails>({ ...company });
    const [adminProducts, setAdminProducts] = useState<Product[]>([...products]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Fetch initial data from Supabase
    useEffect(() => {
        const fetchCloudData = async () => {
            try {
                // Fetch Company Config
                const { data: cData, error: cErr } = await supabase
                    .from('company_config')
                    .select('*')
                    .eq('id', 1)
                    .maybeSingle();
                
                if (cData && !cErr) {
                    const { id, created_at, ...cleanData } = cData;
                    setCompany(cleanData);
                    setAdminCompany(cleanData);
                }

                // Fetch Products
                const { data: pData, error: pErr } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (pData && !pErr) {
                    setProducts(pData);
                    setAdminProducts(pData);
                }
            } catch (err) {
                console.error("Supabase sync failed:", err);
            }
        };
        fetchCloudData();
    }, []);

    useEffect(() => {
        localStorage.setItem("eatsee_company", JSON.stringify(company));
    }, [company]);

    useEffect(() => {
        localStorage.setItem("eatsee_products", JSON.stringify(products));
    }, [products]);

    // Sync query params AND localStorage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true') {
            setIsAdmin(true);
            localStorage.setItem("eatsee_isAdmin", "true");
        }
    }, []);

    const triggerToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const copyLinkToClipboard = (textToCopy: string) => {
        try {
            const textField = document.createElement('textarea');
            textField.innerText = textToCopy;
            document.body.appendChild(textField);
            textField.select();
            document.execCommand('copy');
            textField.remove();
            triggerToast("Link copied to clipboard successfully!");
        } catch (err) {
            triggerToast("Failed to copy. Please write or copy manually.", "error");
        }
    };

    const getCustomerShareUrl = () => {
        return window.location.origin + window.location.pathname;
    };

    const getAdminShareUrl = () => {
        return window.location.origin + window.location.pathname + "?admin=true";
    };

    const handleOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        if (!orderForm.customerName.trim()) {
            triggerToast("Please provide your name to continue.", "error");
            return;
        }

        if (orderForm.deliveryType === "delivery" && !orderForm.location.trim()) {
            triggerToast("Please specify your delivery location.", "error");
            return;
        }

        const itemTotal = selectedProduct.price * orderForm.quantity;
        const deliveryCharge = orderForm.deliveryType === "delivery" 
            ? (itemTotal >= company.freeDeliveryOver ? 0 : company.deliveryCharge) 
            : 0;
        const grandTotal = itemTotal + deliveryCharge;

        const whatsappMessage = 
`*🆕 NEW ORDER FROM ${company.name.toUpperCase()} WEBSITE*
-----------------------------------------
👤 *Customer:* ${orderForm.customerName}

*🛒 ORDER DETAILS:*
• *Item:* ${selectedProduct.nameEnglish} (${selectedProduct.nameMalayalam})
• *Qty:* ${orderForm.quantity} pcs
• *Unit Price:* ${company.currencySymbol}${selectedProduct.price}
• *Subtotal:* ${company.currencySymbol}${itemTotal}

*📍 DELIVERY/COLLECTION DETAILS:*
• *Mode:* ${orderForm.deliveryType === "delivery" ? "🚀 Home Delivery" : "🛍️ Store Pickup"}
${orderForm.deliveryType === "delivery" ? `• *Location:* ${orderForm.location}` : ""}
${orderForm.deliveryType === "delivery" && orderForm.landmark ? `• *Landmark:* ${orderForm.landmark}` : ""}
• *Preferred Time:* ${orderForm.deliveryTime}
${orderForm.notes ? `• *Notes:* "${orderForm.notes}"` : ""}

-----------------------------------------
💳 *BILL BREAKDOWN:*
• Items Total: ${company.currencySymbol}${itemTotal}
• Delivery Fee: ${company.currencySymbol}${deliveryCharge}
*👉 GRAND TOTAL:* *${company.currencySymbol}${grandTotal}*
-----------------------------------------
_Sent via ${company.name} Interactive Web Portal. Please confirm my order!_`;

        const cleanPhone = company.phone.replace(/[+\s-]/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
        
        triggerToast("Opening WhatsApp to complete your order...", "success");
        window.open(waUrl, "_blank");
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === "1234") {
            setIsAdmin(true);
            localStorage.setItem("eatsee_isAdmin", "true");
            setShowLoginModal(false);
            setPinInput("");
            setActiveTab("admin");
            setAdminCompany({...company});
            setAdminProducts([...products]);
            triggerToast("Logged in as Administrator successfully!");
        } else {
            triggerToast("Incorrect Administrator PIN! Please try again.", "error");
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem("eatsee_isAdmin");
        setActiveTab("menu");
        triggerToast("Logged out of Admin Portal.");
    };

    const handleSaveCompanyConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompany({ ...adminCompany });
        
        const { error } = await supabase
            .from('company_config')
            .upsert({ id: 1, ...adminCompany });
        
        if (error) {
            triggerToast("Cloud sync failed: " + error.message, "error");
        } else {
            triggerToast("Store configurations updated successfully!");
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { 
                triggerToast("Logo file too large! Please use a smaller image (under 1MB).", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdminCompany(prev => ({ ...prev, logoUrl: reader.result as string }));
                triggerToast("Logo uploaded successfully! Remember to save changes.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const currentProduct = editingProduct;
        if (file && currentProduct) {
            if (file.size > 1 * 1024 * 1024) {
                triggerToast("Product image too large! Please use a smaller image (under 1MB).", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const b64 = reader.result as string;
                setEditingProduct({ ...currentProduct, imageUrl: b64 });
                handleProductChange(currentProduct.id, "imageUrl", b64);
                triggerToast("Product image uploaded successfully!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProductChange = (id: string, field: string, value: any) => {
        const updated = adminProducts.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value };
            }
            return p;
        });
        setAdminProducts(updated);
    };

    const handleSaveProducts = async () => {
        setProducts([...adminProducts]);
        
        const { error } = await supabase
            .from('products')
            .upsert(adminProducts);
        
        if (error) {
            triggerToast("Error syncing products: " + error.message, "error");
        } else {
            triggerToast("Menu items saved successfully!");
        }
    };

    const handleAddNewProduct = () => {
        setNewProductForm({
            nameEnglish: "",
            nameMalayalam: "",
            price: 0,
            imageUrl: "",
            category: "",
            preparationTime: "",
            deliveryDetails: "",
            description: ""
        });
        setShowAddProductModal(true);
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newProductForm.nameEnglish?.trim() || !newProductForm.nameMalayalam?.trim() || !newProductForm.price) {
            triggerToast("Please enter at least the Product Names and Price.", "error");
            return;
        }

        const productToAdd = {
            nameEnglish: newProductForm.nameEnglish,
            nameMalayalam: newProductForm.nameMalayalam,
            price: newProductForm.price,
            imageUrl: newProductForm.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
            category: newProductForm.category || "General",
            preparationTime: newProductForm.preparationTime || "Not specified",
            deliveryDetails: newProductForm.deliveryDetails || "Standard",
            description: newProductForm.description || ""
        };

        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productToAdd])
                .select()
                .single();

            if (error) {
                triggerToast("Failed to add product: " + error.message, "error");
            } else {
                setProducts([data, ...products]);
                setAdminProducts([data, ...adminProducts]);
                setShowAddProductModal(false);
                setNewProductForm({
                    nameEnglish: "",
                    nameMalayalam: "",
                    price: 0,
                    imageUrl: "",
                    category: "",
                    preparationTime: "",
                    deliveryDetails: "",
                    description: ""
                });
                triggerToast("Product added to menu successfully!");
            }
        } catch (err: any) {
            triggerToast("Error: " + err.message, "error");
        }
    };

    const handleNewProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                triggerToast("Product image too large! Please use a smaller image (under 1MB).", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProductForm(prev => ({ ...prev, imageUrl: reader.result as string }));
                triggerToast("Product image uploaded successfully!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const filteredAdmin = adminProducts.filter(p => p.id !== id);
        const filteredProds = products.filter(p => p.id !== id);
        setAdminProducts(filteredAdmin);
        setProducts(filteredProds);
        if (editingProduct?.id === id) setEditingProduct(null);

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            triggerToast("Error deleting from cloud: " + error.message, "error");
        } else {
            triggerToast("Item removed from Menu.");
        }
    };

    const confirmResetToDefaults = () => {
        setCompany(DEFAULT_COMPANY_DETAILS);
        setAdminCompany(DEFAULT_COMPANY_DETAILS);
        setProducts(DEFAULT_PRODUCTS);
        setAdminProducts(DEFAULT_PRODUCTS);
        localStorage.clear();
        setShowResetConfirm(false);
        triggerToast("Restored original credentials and presets!");
    };

    const exportConfig = () => {
        const configStr = JSON.stringify({ company, products }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(configStr);
        const exportFileDefaultName = 'eatsee_config.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        triggerToast("Configuration JSON exported.");
    };

    const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (parsed.company && parsed.products) {
                    setCompany(parsed.company);
                    setAdminCompany(parsed.company);
                    setProducts(parsed.products);
                    setAdminProducts(parsed.products);
                    triggerToast("Configuration imported successfully!");
                } else {
                    triggerToast("Invalid configurations detected.", "error");
                }
            } catch (err) {
                triggerToast("Failed to parse JSON configuration.", "error");
            }
        };
    };

    return (
        <div className="flex-grow flex flex-col justify-between">
            
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transition-all flex items-center gap-3 border ${
                    toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-200' : 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
                }`}>
                    <i className={toast.type === 'error' ? "fa-solid fa-circle-exclamation text-xl text-red-400" : "fa-solid fa-circle-check text-xl text-emerald-400"}></i>
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#0c2d20]/90 border-b border-emerald-900/60 shadow-lg px-2 sm:px-4 py-3 sm:py-4 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
                    
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center justify-center shadow max-h-10 sm:max-h-12 overflow-hidden">
                            {company.logoUrl ? (
                                <img 
                                    src={company.logoUrl} 
                                    alt={company.name} 
                                    className="h-6 sm:h-8 w-auto object-contain"
                                    onError={(e: any) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="bg-[#0c2d20] text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-black text-[10px] sm:text-xs">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <span className="text-[10px] text-slate-300 block leading-none">{company.address}</span>
                        </div>
                    </div>

                    {/* Slogan - Hidden on very small, visible on sm and up */}
                    <div className="hidden sm:block text-center flex-grow">
                        <h1 className="font-bold text-lg md:text-xl text-white tracking-wide malayalam-title font-serif truncate">{company.sloganMalayalam}</h1>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button 
                            onClick={() => setActiveTab("menu")}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                                activeTab === "menu" 
                                    ? "bg-white text-[#0c2d20] shadow-md" 
                                    : "hover:bg-emerald-900/50 text-emerald-200"
                            }`}
                        >
                            <i className="fa-solid fa-utensils sm:mr-2"></i> <span className="hidden xs:inline">Menu</span>
                        </button>
                        {isAdmin ? (
                            <div className="flex items-center gap-1 bg-emerald-950/60 p-0.5 sm:p-1 rounded-full">
                                <button 
                                    onClick={() => {
                                        setActiveTab("admin");
                                        setAdminCompany({...company});
                                        setAdminProducts([...products]);
                                    }}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                                        activeTab === "admin" 
                                            ? "bg-amber-400 text-amber-950 shadow-md" 
                                            : "hover:bg-emerald-900/50 text-amber-200/80"
                                    }`}
                                >
                                    <i className="fa-solid fa-sliders sm:mr-2"></i> <span className="hidden xs:inline">Customize</span>
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    title="Logout"
                                    className="px-2 py-1.5 sm:py-2 rounded-full text-slate-400 hover:text-red-400 transition-all text-xs sm:text-sm"
                                >
                                    <i className="fa-solid fa-power-off"></i>
                                </button>
                            </div>
                        ) : (
                            /* Only show Login button if 'admin=true' is in the URL */
                            new URLSearchParams(window.location.search).get('admin') === 'true' && (
                                <button 
                                    onClick={() => setShowLoginModal(true)}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-800 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                >
                                    <i className="fa-solid fa-lock sm:mr-2"></i> <span className="hidden xs:inline">Login</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* Quick Info Bar */}
            <section className="bg-[#092218] py-2 px-4 text-center text-[10px] sm:text-xs md:text-sm text-emerald-200 border-b border-emerald-900/40">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2">
                    <span className="opacity-80">📍 Omassery & Nearby Areas • Hot & Fresh Delivery</span>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <a href={`https://wa.me/${company.phone.replace(/[+\s-]/g, "")}`} target="_blank" className="hover:underline flex items-center gap-1 text-emerald-300 font-semibold">
                            <i className="fa-brands fa-whatsapp text-emerald-400 text-sm"></i> {company.phone}
                        </a>
                        <button 
                            onClick={() => setShowFlyerModal(true)} 
                            className="bg-emerald-900/50 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-300 border border-emerald-700 hover:bg-emerald-800 transition-all"
                        >
                            <i className="fa-regular fa-image mr-1"></i> <span className="xs:inline">Flyer</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Workspace */}
            <main className="flex-grow max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10">
                {activeTab === "menu" ? (
                    <div className="flex flex-col items-center">
                        {/* Malayalam Poster Header Slogan */}
                        <div className="text-center mb-6 sm:mb-10 mt-2 sm:mt-4">
                            <h2 className="text-2xl xs:text-3xl md:text-5xl font-bold text-white tracking-wide mb-4 sm:mb-6 malayalam-title leading-snug px-2">
                                {company.sloganMalayalam}
                            </h2>
                            {/* White Badge "Our Menu" exactly styled like the poster image_82eb2b.jpg */}
                            <div className="bg-white text-[#0c2d20] text-sm sm:text-lg font-bold px-8 sm:px-12 py-1.5 sm:py-2.5 rounded-full inline-block shadow-xl border border-slate-100/10 uppercase tracking-widest">
                                Our Menu
                            </div>
                        </div>

                        {/* Menu Items Grid */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 w-full max-w-5xl mt-6">
                            {products.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedProduct(item);
                                        setOrderForm(prev => ({ ...prev, quantity: 10 })); 
                                    }}
                                    className="poster-card text-center p-5 sm:p-8 flex flex-col items-center justify-between relative overflow-hidden cursor-pointer shadow-lg active:scale-95 transition-transform"
                                >
                                    {/* Poster card subtle double background wave design overlay */}
                                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <path d="M0,40 Q25,20 50,40 T100,40 L100,100 L0,100 Z" fill="#0c2d20" />
                                            <path d="M0,50 Q25,35 50,55 T100,45" fill="none" stroke="#0c2d20" strokeWidth="1" />
                                            <path d="M0,60 Q25,45 50,65 T100,55" fill="none" stroke="#0c2d20" strokeWidth="1" />
                                        </svg>
                                    </div>

                                    {/* Circular Plate Layout frame */}
                                    <div className="relative w-36 h-36 sm:w-48 sm:h-48 mb-4 sm:mb-6 rounded-full p-2 bg-gradient-to-tr from-emerald-50 to-white shadow-inner flex items-center justify-center z-10">
                                        <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-dashed border-emerald-900/10 shadow-md">
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.nameEnglish}
                                                onError={(e: any) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://placehold.co/400x400/0f382a/ffffff?text=${item.nameEnglish}`;
                                                }}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Malayalam Name from image_82eb2b.jpg */}
                                    <div className="z-10 mb-4 sm:mb-6">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-[#0c2d20] malayalam-title leading-tight mb-1 sm:mb-2 font-serif">
                                            {item.nameMalayalam}
                                        </h3>
                                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-emerald-800/60 block">
                                            {item.nameEnglish}
                                        </span>
                                    </div>

                                    {/* Dark Green Price Badge exactly like image_82eb2b.jpg */}
                                    <div className="z-10 bg-[#0c2d20] text-white font-bold text-base sm:text-xl px-8 sm:px-10 py-1.5 sm:py-2 rounded-full shadow-lg min-w-[100px] border border-emerald-950">
                                        {company.currencySymbol}{item.price}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-20 bg-emerald-950/30 rounded-3xl border border-dashed border-emerald-800/40 w-full">
                                <i className="fa-solid fa-basket-shopping text-5xl text-emerald-700 mb-4"></i>
                                <h3 className="text-xl font-bold">No Menu Items Configured</h3>
                                <p className="text-emerald-300/60 mt-2">Go to the Customize Panel to add product details.</p>
                                {/* Only show Admin Login button if 'admin=true' is in the URL */}
                                {!isAdmin && new URLSearchParams(window.location.search).get('admin') === 'true' && (
                                    <button 
                                        onClick={() => setShowLoginModal(true)}
                                        className="mt-4 bg-amber-400 hover:bg-amber-500 text-[#0c2d20] text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                    >
                                        <i className="fa-solid fa-lock mr-1.5"></i> Access Admin Panel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#0f382a]/50 rounded-3xl p-6 border border-emerald-900 shadow-2xl backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-900/80 pb-6 mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                                    <i className="fa-solid fa-screwdriver-wrench"></i> Configure Store
                                </h2>
                                <p className="text-sm text-emerald-200/70 mt-1">Live updates of the logo, brand names, and menu card attributes.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={exportConfig} 
                                    className="bg-emerald-800 text-white hover:bg-emerald-700 text-xs font-semibold px-4 py-2 rounded-xl border border-emerald-600 transition-all flex items-center gap-1.5"
                                >
                                    <i className="fa-solid fa-download"></i> Export JSON
                                </button>
                                <label className="bg-emerald-800 text-white hover:bg-emerald-700 text-xs font-semibold px-4 py-2 rounded-xl border border-emerald-600 cursor-pointer transition-all flex items-center gap-1.5">
                                    <i className="fa-solid fa-upload"></i> Import JSON
                                    <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                                </label>
                                <button 
                                    onClick={() => setShowResetConfirm(true)} 
                                    className="bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs font-semibold px-4 py-2 rounded-xl border border-rose-800 transition-all flex items-center gap-1.5"
                                >
                                    <i className="fa-solid fa-rotate-left"></i> Reset Defaults
                                </button>
                            </div>
                        </div>

                        {/* Link Generator & Sharer Console */}
                        <div className="mb-8 p-5 rounded-2xl bg-emerald-950/80 border border-amber-500/30 shadow-md">
                            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-share-nodes"></i> Shareable Storefront Links
                            </h3>
                            <p className="text-xs text-emerald-200/80 mb-4">
                                Send the Customer Link to your users. They will only see the menu and have no access to your administrative panel. Keep the private Admin Link for your own use.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer Link Box */}
                                <div className="bg-[#0c2d20] p-3 rounded-xl border border-emerald-900">
                                    <span className="block text-[10px] text-emerald-400 font-extrabold uppercase mb-1">Customer Link (Share on WhatsApp)</span>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={getCustomerShareUrl()} 
                                            className="w-full bg-emerald-950/80 border border-emerald-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                                        />
                                        <button 
                                            onClick={() => copyLinkToClipboard(getCustomerShareUrl())}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-[#0c2d20] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                                        >
                                            <i className="fa-solid fa-copy"></i> Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Admin Link Box */}
                                <div className="bg-[#0c2d20] p-3 rounded-xl border border-emerald-900">
                                    <span className="block text-[10px] text-amber-400 font-extrabold uppercase mb-1">Admin Panel Access Link (Keep Safe)</span>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={getAdminShareUrl()} 
                                            className="w-full bg-emerald-950/80 border border-emerald-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                                        />
                                        <button 
                                            onClick={() => copyLinkToClipboard(getAdminShareUrl())}
                                            className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                                        >
                                            <i className="fa-solid fa-copy"></i> Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Company Settings Form */}
                            <div className="bg-emerald-950/90 rounded-2xl p-6 border border-emerald-900/60 shadow-lg">
                                <h3 className="text-xl font-bold text-white border-b border-emerald-900 pb-3 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-shop text-emerald-400"></i> Store Identity
                                </h3>
                                <form onSubmit={handleSaveCompanyConfig} className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Company / Brand Name</label>
                                        <input 
                                            type="text" 
                                            value={adminCompany.name} 
                                            onChange={(e) => setAdminCompany({...adminCompany, name: e.target.value})}
                                            className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Store Logo</label>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={adminCompany.logoUrl || ""} 
                                                    onChange={(e) => setAdminCompany({...adminCompany, logoUrl: e.target.value})}
                                                    placeholder="Logo URL or Upload below"
                                                    className="flex-grow bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                                />
                                            </div>
                                            <label className="w-full bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800 border-dashed rounded-xl px-4 py-2.5 text-emerald-300 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                                Upload from Device
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-emerald-300/60 mt-1">Prefer transparent PNG. Max size 1MB.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Tagline / Header Description</label>
                                        <input 
                                            type="text" 
                                            value={adminCompany.tagline} 
                                            onChange={(e) => setAdminCompany({...adminCompany, tagline: e.target.value})}
                                            className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Slogan Text (Malayalam)</label>
                                        <input 
                                            type="text" 
                                            value={adminCompany.sloganMalayalam} 
                                            onChange={(e) => setAdminCompany({...adminCompany, sloganMalayalam: e.target.value})}
                                            className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-serif" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Address Location</label>
                                        <input 
                                            type="text" 
                                            value={adminCompany.address} 
                                            onChange={(e) => setAdminCompany({...adminCompany, address: e.target.value})}
                                            className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">WhatsApp Order Number</label>
                                        <input 
                                            type="text" 
                                            value={adminCompany.phone} 
                                            onChange={(e) => setAdminCompany({...adminCompany, phone: e.target.value})}
                                            className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Delivery Fee (₹)</label>
                                            <input 
                                                type="number" 
                                                value={adminCompany.deliveryCharge} 
                                                onChange={(e) => setAdminCompany({...adminCompany, deliveryCharge: parseInt(e.target.value) || 0})}
                                                className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-emerald-400 font-bold uppercase mb-1">Free Delivery Over (₹)</label>
                                            <input 
                                                type="number" 
                                                value={adminCompany.freeDeliveryOver} 
                                                onChange={(e) => setAdminCompany({...adminCompany, freeDeliveryOver: parseInt(e.target.value) || 0})}
                                                className="w-full bg-[#0c2d20] border border-emerald-950 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0c2d20] font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-sm mt-4"
                                    >
                                        <i className="fa-solid fa-floppy-disk mr-1.5"></i> Update Core Configurations
                                    </button>
                                </form>
                            </div>

                            {/* Products Admin List */}
                            <div className="lg:col-span-2 bg-emerald-950/90 rounded-2xl p-6 border border-emerald-900/60 shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center border-b border-emerald-900 pb-3 mb-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <i className="fa-solid fa-rectangle-list text-emerald-400"></i> Manage Menu Poster
                                        </h3>
                                        <button 
                                            onClick={handleAddNewProduct}
                                            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                        >
                                            <i className="fa-solid fa-plus"></i> Add New Item
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scroll pr-1 sm:pr-2">
                                        {adminProducts.map((p) => (
                                            <div key={p.id} className="bg-[#0c2d20]/80 border border-emerald-900 p-3 sm:p-4 rounded-xl flex items-center justify-between gap-2 sm:gap-4">
                                                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                                    <img 
                                                        src={p.imageUrl} 
                                                        alt={p.nameEnglish}
                                                        onError={(e: any) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://placehold.co/100x100/0f382a/ffffff?text=" + p.nameEnglish;
                                                        }}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover bg-emerald-900 shrink-0" 
                                                    />
                                                    <div className="truncate">
                                                        <h4 className="font-bold text-slate-100 font-serif text-sm sm:text-base truncate">{p.nameMalayalam}</h4>
                                                        <p className="text-[10px] sm:text-xs text-emerald-400 uppercase font-bold tracking-wider truncate">{p.nameEnglish} • {company.currencySymbol}{p.price}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingProduct(editingProduct?.id === p.id ? null : p);
                                                            if (editingProduct?.id !== p.id) {
                                                                setTimeout(() => {
                                                                    const el = document.getElementById('edit-product-form');
                                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                                }, 100);
                                                            }
                                                        }}
                                                        className="bg-emerald-800/80 hover:bg-emerald-800 text-emerald-300 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg border border-emerald-700 transition-all"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i> <span className="hidden xs:inline">{editingProduct?.id === p.id ? "Close" : "Edit"}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteProduct(p.id)}
                                                        className="bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg border border-rose-900 transition-all"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-emerald-900/80 mt-4">
                                    <button 
                                        onClick={handleSaveProducts}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0c2d20] font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm"
                                    >
                                        <i className="fa-solid fa-circle-check mr-1.5"></i> Save & Apply Changes to Poster
                                    </button>
                                </div>
                            </div>
                        </div>

                        {editingProduct && (
                            <div id="edit-product-form" className="mt-8 bg-emerald-950/40 p-6 rounded-2xl border border-dashed border-emerald-800/60 scroll-mt-20">
                                <div className="flex justify-between items-center mb-4 border-b border-emerald-900 pb-2">
                                    <h4 className="text-lg font-bold text-amber-300">
                                        Editing: {editingProduct.nameEnglish} ({editingProduct.nameMalayalam})
                                    </h4>
                                    <button onClick={() => setEditingProduct(null)} className="text-emerald-400 hover:text-white">
                                        <i className="fa-solid fa-circle-xmark text-xl"></i>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Name (English)</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.nameEnglish}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditingProduct(prev => prev ? {...prev, nameEnglish: val} : null);
                                                handleProductChange(editingProduct.id, "nameEnglish", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Name (Malayalam)</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.nameMalayalam}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditingProduct(prev => prev ? {...prev, nameMalayalam: val} : null);
                                                handleProductChange(editingProduct.id, "nameMalayalam", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs font-serif focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Price (₹ INR)</label>
                                        <input 
                                            type="number" 
                                            value={editingProduct.price}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setEditingProduct(prev => prev ? {...prev, price: val} : null);
                                                handleProductChange(editingProduct.id, "price", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Product Image</label>
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                type="text" 
                                                value={editingProduct.imageUrl}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditingProduct(prev => prev ? {...prev, imageUrl: val} : null);
                                                    handleProductChange(editingProduct.id, "imageUrl", val);
                                                }}
                                                placeholder="Image URL or Upload below"
                                                className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                            />
                                            <label className="w-full bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800 border-dashed rounded-lg px-3 py-2 text-emerald-300 text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                                Upload Image
                                                <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Category</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.category}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditingProduct(prev => prev ? {...prev, category: val} : null);
                                                handleProductChange(editingProduct.id, "category", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Preparation Time</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.preparationTime}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditingProduct(prev => prev ? {...prev, preparationTime: val} : null);
                                                handleProductChange(editingProduct.id, "preparationTime", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Product Description</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.description}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditingProduct(prev => prev ? {...prev, description: val} : null);
                                                handleProductChange(editingProduct.id, "description", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-emerald-400 font-bold mb-1 uppercase">Delivery/Sourcing Information</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.deliveryDetails}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEditingProduct(prev => prev ? {...prev, deliveryDetails: val} : null);
                                                handleProductChange(editingProduct.id, "deliveryDetails", val);
                                            }}
                                            className="w-full bg-[#0c2d20] border border-emerald-900 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Customer Product Details and Order Config Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white text-slate-900 rounded-[24px] sm:rounded-[36px] w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto sm:my-8 max-h-[95vh] flex flex-col">
                        
                        <div className="relative h-40 xs:h-48 sm:h-56 bg-[#0c2d20] flex-shrink-0">
                            <img 
                                src={selectedProduct.imageUrl} 
                                alt={selectedProduct.nameEnglish} 
                                onError={(e: any) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400/0f382a/ffffff?text=" + selectedProduct.nameEnglish;
                                }}
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                            
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-2 sm:p-2.5 transition-all shadow"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>

                            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-white">
                                <h3 className="text-xl xs:text-2xl sm:text-3xl font-black font-serif leading-none malayalam-title">{selectedProduct.nameMalayalam}</h3>
                                <p className="text-emerald-300 font-semibold uppercase tracking-wider text-[10px] sm:text-xs mt-1">{selectedProduct.nameEnglish}</p>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 overflow-y-auto custom-scroll flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-100">
                                
                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <h4 className="text-[10px] sm:text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Details</h4>
                                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{selectedProduct.description || "Delicate food prepared fresh and packed with care."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div className="bg-emerald-50 p-2 sm:p-2.5 rounded-xl border border-emerald-100/60">
                                            <span className="text-[9px] sm:text-[10px] uppercase text-emerald-800 font-bold block">Rate Per Piece</span>
                                            <span className="text-base sm:text-lg font-bold text-emerald-950">{company.currencySymbol}{selectedProduct.price}</span>
                                        </div>
                                        <div className="bg-emerald-50 p-2 sm:p-2.5 rounded-xl border border-emerald-100/60">
                                            <span className="text-[9px] sm:text-[10px] uppercase text-emerald-800 font-bold block">Ready within</span>
                                            <span className="text-[10px] sm:text-xs font-bold text-emerald-950 flex items-center mt-1"><i className="fa-regular fa-clock mr-1"></i> {selectedProduct.preparationTime}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] sm:text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Delivery Info</h4>
                                        <p className="text-slate-600 text-[10px] sm:text-xs italic">{selectedProduct.deliveryDetails || "Delivery available in Omassery region. Confirm details with us on checkout."}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleOrderSubmit} id="order-submit-form" className="space-y-3 sm:space-y-4">
                                    <h4 className="text-[10px] sm:text-xs uppercase text-slate-400 font-bold tracking-wider">Configure Your Order</h4>
                                    
                                    <div>
                                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">Quantity (Set/Pieces)</label>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setOrderForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 5) }))}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all"
                                            >
                                                -5
                                            </button>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={orderForm.quantity}
                                                onChange={(e) => setOrderForm({...orderForm, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                                                className="w-16 sm:w-20 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 sm:py-1.5 text-slate-800 font-bold text-xs sm:text-sm focus:outline-none"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setOrderForm(prev => ({ ...prev, quantity: prev.quantity + 5 }))}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all"
                                            >
                                                +5
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">Fulfillment Mode</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setOrderForm({...orderForm, deliveryType: "delivery"})}
                                                className={`py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all ${
                                                    orderForm.deliveryType === "delivery"
                                                        ? "bg-[#0c2d20] border-emerald-950 text-white shadow"
                                                        : "bg-slate-50 border-slate-200 text-slate-600"
                                                }`}
                                            >
                                                🚀 Home Delivery
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOrderForm({...orderForm, deliveryType: "pickup"})}
                                                className={`py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all ${
                                                    orderForm.deliveryType === "pickup"
                                                        ? "bg-[#0c2d20] border-emerald-950 text-white shadow"
                                                        : "bg-slate-50 border-slate-200 text-slate-600"
                                                }`}
                                            >
                                                🛍️ Store Pickup
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={orderForm.customerName}
                                            onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                                            placeholder="e.g. Rahul P"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {orderForm.deliveryType === "delivery" && (
                                        <React.Fragment>
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">Delivery Location</label>
                                                <input 
                                                    type="text" 
                                                    required={orderForm.deliveryType === "delivery"}
                                                    value={orderForm.location}
                                                    onChange={(e) => setOrderForm({...orderForm, location: e.target.value})}
                                                    placeholder="e.g. Thamarassery Road, Omassery"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </React.Fragment>
                                    )}
                                </form>
                            </div>

                            <div className="mt-4 bg-emerald-50/50 rounded-2xl p-3 sm:p-4 border border-emerald-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
                                <div>
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Grand Total</span>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                                            {company.currencySymbol}{selectedProduct.price * orderForm.quantity + (orderForm.deliveryType === 'delivery' ? ((selectedProduct.price * orderForm.quantity) >= company.freeDeliveryOver ? 0 : company.deliveryCharge) : 0)}
                                        </span>
                                        <span className="text-[9px] sm:text-[10px] text-slate-400">
                                            ({orderForm.quantity} pcs)
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    form="order-submit-form"
                                    className="bg-[#0c2d20] hover:bg-[#154632] text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all w-full xs:w-auto justify-center text-xs sm:text-sm"
                                >
                                    <i className="fa-brands fa-whatsapp text-lg"></i> <span className="xs:inline">Order via WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Access Login Portal Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
                        <button 
                            onClick={() => {
                                setShowLoginModal(false);
                                setPinInput("");
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                        
                        <div className="w-16 h-16 bg-amber-950/80 border border-amber-600/40 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fa-solid fa-lock"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Administrative Login</h3>
                        <p className="text-xs text-slate-400 mb-4">Please input your secure admin passcode to modify prices, logos, and items.</p>
                        
                        <form onSubmit={handleLoginSubmit} className="space-y-3">
                            <input 
                                type="password"
                                required
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                placeholder="Enter PIN (Default is 1234)"
                                className="w-full bg-slate-950 border border-slate-800 text-center tracking-widest font-black text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button 
                                type="submit"
                                className="w-full bg-amber-400 hover:bg-amber-500 text-[#0c2d20] font-bold py-2.5 rounded-xl text-sm shadow transition-all"
                            >
                                Authorize Portal
                            </button>
                        </form>
                        <p className="text-[10px] text-slate-500 mt-3 italic">Tip: Use secure PIN <span className="font-extrabold text-amber-400">1234</span> to log in instantly.</p>
                    </div>
                </div>
            )}

            {/* View Original Flyer Modal */}
            {showFlyerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-slate-900 border border-slate-800">
                        <div className="absolute top-4 right-4 z-10">
                            <button 
                                onClick={() => setShowFlyerModal(false)}
                                className="bg-slate-950/80 hover:bg-slate-950 text-white rounded-full p-2.5 transition-all shadow"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        
                        <div className="p-2">
                            <img 
                                src="image_82eb2b.jpg" 
                                alt="Food Products Original Menu Flyer" 
                                className="w-full h-auto max-h-[80vh] rounded-lg object-contain bg-slate-950"
                                onError={(e: any) => {
                                    e.target.onerror = null;
                                    triggerToast("Failed to locate original flyer image resource.", "error");
                                }}
                            />
                        </div>
                        <div className="bg-slate-950 py-3 px-4 text-center text-xs text-emerald-400 font-bold border-t border-slate-900">
                            Original Print Menu & Pricing Guide
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal for Configurations Reset */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-950 border border-red-800 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Reset Configurations?</h3>
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                            Are you sure you want to restore the original brand settings? This will restore the 6 original items from image_82eb2b.jpg and clear your modifications.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setShowResetConfirm(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmResetToDefaults}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                            >
                                Yes, Reset Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Product Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0c2d20] border border-emerald-900 rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8">
                        <button 
                            onClick={() => setShowAddProductModal(false)}
                            className="absolute top-6 right-6 text-emerald-400 hover:text-white transition-all"
                        >
                            <i className="fa-solid fa-circle-xmark text-2xl"></i>
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6 border-b border-emerald-900/60 pb-4">
                            <div className="w-12 h-12 bg-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center text-xl">
                                <i className="fa-solid fa-plus"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Add New Menu Item</h3>
                                <p className="text-xs text-emerald-300/60">Fill in the details to add a new product to your menu poster.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Item Name (English)</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Chicken Biriyani"
                                        value={newProductForm.nameEnglish}
                                        onChange={(e) => setNewProductForm({...newProductForm, nameEnglish: e.target.value})}
                                        className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Item Name (Malayalam)</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="ഉദാ: ചിക്കൻ ബിരിയാണി"
                                        value={newProductForm.nameMalayalam}
                                        onChange={(e) => setNewProductForm({...newProductForm, nameMalayalam: e.target.value})}
                                        className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm font-serif focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Price ({company.currencySymbol})</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        value={newProductForm.price || ""}
                                        onChange={(e) => setNewProductForm({...newProductForm, price: parseInt(e.target.value) || 0})}
                                        className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Category</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Main Course"
                                        value={newProductForm.category}
                                        onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                                        className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Product Image</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="w-full sm:w-32 h-32 bg-[#081f16] border border-emerald-900 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
                                        {newProductForm.imageUrl ? (
                                            <img src={newProductForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <i className="fa-regular fa-image text-3xl text-emerald-800"></i>
                                        )}
                                    </div>
                                    <div className="flex-grow space-y-3">
                                        <input 
                                            type="text" 
                                            placeholder="Paste Image URL or upload below"
                                            value={newProductForm.imageUrl}
                                            onChange={(e) => setNewProductForm({...newProductForm, imageUrl: e.target.value})}
                                            className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                        <label className="w-full bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-800 border-dashed rounded-xl px-4 py-3 text-emerald-300 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                            Upload from Device
                                            <input type="file" accept="image/*" onChange={handleNewProductImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Preparation Time</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 20 mins"
                                        value={newProductForm.preparationTime}
                                        onChange={(e) => setNewProductForm({...newProductForm, preparationTime: e.target.value})}
                                        className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Delivery Details</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Served hot with chutney"
                                        value={newProductForm.deliveryDetails}
                                        onChange={(e) => setNewProductForm({...newProductForm, deliveryDetails: e.target.value})}
                                        className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Product Description</label>
                                <textarea 
                                    placeholder="Write a tasty description of your dish..."
                                    value={newProductForm.description}
                                    onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                                    rows={3}
                                    className="w-full bg-[#081f16] border border-emerald-900 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none" 
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-lg uppercase tracking-widest"
                            >
                                <i className="fa-solid fa-circle-check"></i> Add Product to Menu
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-[#0c2d20] mt-12 py-10 px-4 flex flex-col items-center">
                <div className="max-w-4xl w-full flex flex-col items-center gap-6">
                    
                    {/* Signature Footer Capsule Replicating bottom section of image_82eb2b.jpg */}
                    <div className="bg-white px-8 py-5 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl w-full max-w-2xl border border-emerald-100/10">
                        
                        {/* Logo Left Section */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center">
                                {company.logoUrl ? (
                                    <img 
                                        src={company.logoUrl} 
                                        alt={company.name} 
                                        className="h-12 w-auto object-contain"
                                        onError={(e: any) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="bg-[#0c2d20] text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-sm">
                                        {company.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Center Circular Phone Logo Block */}
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-full flex items-center justify-center shadow-sm">
                                <i className="fa-solid fa-phone text-[#0c2d20] text-xl"></i>
                            </div>
                            <div className="text-left text-slate-800">
                                <p className="text-[10px] text-emerald-800 font-extrabold tracking-widest uppercase">Direct Delivery Line</p>
                                <p className="text-lg font-black tracking-tight">{company.phone}</p>
                            </div>
                        </div>

                        {/* Right Text Block */}
                                <div className="text-center md:text-right text-slate-700 text-xs">
                                    <p className="text-slate-500 font-medium">{company.address}</p>
                                </div>
                    </div>

                    <div className="space-y-2 text-center text-xs text-emerald-300/60 mt-4">
                        <p>© 2026 Food Products. All rights reserved.</p>
                        <div className="flex items-center justify-center gap-2 text-[10px]">
                            <span className="opacity-80">Design perfectly from "graphi.qo".</span>
                            <span>•</span>
                            <button 
                                onClick={() => {
                                    if (isAdmin) {
                                        setActiveTab("admin");
                                    } else if (new URLSearchParams(window.location.search).get('admin') === 'true') {
                                        setShowLoginModal(true);
                                    }
                                }} 
                                className={`hover:underline text-amber-400 font-bold ${(!isAdmin && new URLSearchParams(window.location.search).get('admin') !== 'true') ? 'hidden' : ''}`}
                            >
                                {isAdmin ? "Admin Settings" : "Admin Panel Login"}
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
