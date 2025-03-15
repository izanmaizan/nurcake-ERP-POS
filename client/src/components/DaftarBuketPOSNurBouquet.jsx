import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Search, Cake, Package, Plus, Trash2 } from "lucide-react";

const DaftarBuketPOSNurBouquet = ({ handleAddProduk }) => {
  // State management
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    design: "",
    flowerType: "",
    size: "",
    pickupDate: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/produkNBA");
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data produk");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nama_produk
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.kategori === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products
  const categories = [...new Set(products.map((product) => product.kategori))];

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Format product data to match parent component expectations
  const formatProductForParent = (product) => {
    return {
      id: product.id_produk,
      nama: product.nama_produk,
      harga: parseFloat(product.harga),
      stok: parseInt(product.stok),
      kategori: product.kategori,
      foto: product.foto_produk,
      status: product.status,
    };
  };

  // Handle adding product to cart
  const handleAddToCart = (product) => {
    const formattedProduct = formatProductForParent(product);
    handleAddProduk(formattedProduct);
  };

  if (loading) {
    return <div className="text-center py-8">Memuat data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    // DaftarBuketPOSNurBouquet
    <section className="mb-8">
      <h2 className="text-3xl font-bold text-[#FFD700] font-Roboto">
        Daftar Buket
      </h2>

      {/* Search and Category Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-5 gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#DAA520]" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari Buket..."
            className="w-full p-2 pl-10 rounded-md bg-[#1a1a1a] text-[#DAA520] border-[#FFD700] border focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
        </div>

        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border-[#FFD700] border focus:outline-none focus:ring-2 focus:ring-[#FFD700]">
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id_produk}
            className="overflow-hidden group bg-[#1a1a1a] border border-[#FFD700]">
            <div className="aspect-square overflow-hidden">
              <img
                src={`http://localhost:3000/${product.foto_produk}`}
                alt={product.nama_produk}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-[#FFD700]">
                {product.nama_produk}
              </h3>
              <p className="text-[#FFD700] font-medium mb-1">
                Rp {parseInt(product.harga).toLocaleString()}
              </p>
              <p className="text-[#DAA520] text-sm mb-1">
                Stok: {product.stok}
              </p>
              <p className="text-[#DAA520] text-sm mb-2">
                Status: {product.status}
              </p>
              <p className="text-[#DAA520] text-sm mb-4">{product.deskripsi}</p>

              <Button
                onClick={() => handleAddToCart(product)}
                disabled={product.stok === 0 || product.status !== "Tersedia"}
                className={`w-full ${
                  product.stok === 0 || product.status !== "Tersedia"
                    ? "bg-[#1a1a1a] text-gray-500 cursor-not-allowed border-gray-500"
                    : "bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]"
                }`}>
                {product.stok === 0
                  ? "Stok Habis"
                  : product.status !== "Tersedia"
                    ? "Tidak Tersedia"
                    : "Tambah"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default DaftarBuketPOSNurBouquet;
