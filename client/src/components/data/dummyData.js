// dummyData.js

export const dummyProducts = [
  // Custom Cakes
  {
    id: 1,
    nama: "Birthday Cake Custom",
    kategori: "Custom Cake",
    harga: 350000,
    stok: 10,
    gambar: `https://picsum.photos/400/400?random`, // You'll need to add actual image paths
  },
  {
    id: 2,
    nama: "Wedding Cake Custom",
    kategori: "Custom Cake",
    harga: 1500000,
    stok: 5,
    gambar: `https://picsum.photos/400/400?random`,
  },
  {
    id: 3,
    nama: "Anniversary Cake Custom",
    kategori: "Custom Cake",
    harga: 450000,
    stok: 8,
    gambar: `https://picsum.photos/400/400?random`,
  },

  // Roti (Bread)
  {
    id: 4,
    nama: "Roti Tawar",
    kategori: "Roti",
    harga: 15000,
    stok: 50,
    gambar: `https://picsum.photos/400/400?random`,
  },
  {
    id: 5,
    nama: "Roti Cokelat",
    kategori: "Roti",
    harga: 8000,
    stok: 30,
    gambar: `https://picsum.photos/400/400?random`,
  },
  {
    id: 6,
    nama: "Roti Keju",
    kategori: "Roti",
    harga: 8500,
    stok: 25,
    gambar: `https://picsum.photos/400/400?random`,
  },

  // Kue Kering (Cookies)
  {
    id: 7,
    nama: "Nastar",
    kategori: "Kue Kering",
    harga: 55000,
    stok: 40,
    gambar: `https://picsum.photos/400/400?random`,
  },
  {
    id: 8,
    nama: "Kastengel",
    kategori: "Kue Kering",
    harga: 60000,
    stok: 35,
    gambar: `https://picsum.photos/400/400?random`,
  },
  {
    id: 9,
    nama: "Putri Salju",
    kategori: "Kue Kering",
    harga: 50000,
    stok: 45,
    gambar: `https://picsum.photos/400/400?random`,
  },
];

// You can also add dummy orders if needed
export const dummyOrders = [
  {
    id: 1,
    design: "Birthday Cake dengan tema Unicorn",
    flavor: "Vanilla",
    size: "20x20 cm",
    pickupDate: "2024-01-15",
    status: "pending",
  },
  {
    id: 2,
    design: "Wedding Cake 3 Tingkat",
    flavor: "Red Velvet",
    size: "30x30 cm",
    pickupDate: "2024-02-20",
    status: "processing",
  },
];
