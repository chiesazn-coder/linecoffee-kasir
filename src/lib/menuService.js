import { db } from './firebase';
import { supabase } from './supabase'; // Diimpor kembali agar file lain tidak error
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
  query, 
  orderBy 
} from 'firebase/firestore';

// ==========================================
// 1. AMBIL SEMUA MENU (Kategori + Items)
// ==========================================
export async function fetchMenu() {
  try {
    // a. Ambil semua categories, diurutkan berdasarkan display_order
    const categoriesSnapshot = await getDocs(
      query(collection(db, 'categories'), orderBy('display_order', 'asc'))
    );
    
    // b. Ambil semua menu_items
    const itemsSnapshot = await getDocs(collection(db, 'menu_items'));
    
    // c. Mapping data items ke array biasa
    const allItems = itemsSnapshot.docs.map(doc => ({
      id: parseInt(doc.id) || doc.id,
      ...doc.data()
    }));

    // d. Validasi jika data kategori di Firebase masih kosong
    if (categoriesSnapshot.empty) {
      console.warn("Koleksi 'categories' di Firestore masih kosong!");
      return [];
    }

    // e. Gabungkan data items ke kategorinya masing-masing (Client-side Join)
    const formattedMenu = categoriesSnapshot.docs.map(catDoc => {
      const catData = catDoc.data();
      const catId = parseInt(catDoc.id) || catDoc.id;

      // Filter item yang sesuai dengan ID kategori ini
      const filteredItems = allItems.filter(item => item.category_id === catId);

      return {
        id: catId,
        category: catData.name || "Tanpa Kategori", // Mapping 'name' ke properti 'category'
        items: filteredItems
      };
    });

    return formattedMenu;
  } catch (error) {
    console.error("Error fetching menu from Firestore:", error);
    return []; // Kembalikan array kosong jika terjadi error agar aplikasi tidak ngeblank putih
  }
}

// ==========================================
// 2. UPDATE HARGA BERDASARKAN ID ITEM
// ==========================================
export async function updateMenuItemPrice(itemId, newPrices) {
  try {
    const docRef = doc(db, 'menu_items', itemId.toString());
    await updateDoc(docRef, { prices: newPrices });
  } catch (error) {
    console.error("Error updating price in Firestore:", error);
    throw error;
  }
}

// ==========================================
// 3. FUNGSI UNTUK TAMBAH ITEM BARU
// ==========================================
export async function addMenuItem(categoryId, name, prices) {
  try {
    // Gunakan Timestamp milidetik sebagai ID number unik agar tidak merusak sistem sortir angka kamu
    const newId = Date.now(); 
    const docRef = doc(db, 'menu_items', newId.toString());

    const newItemData = {
      category_id: parseInt(categoryId) || categoryId, 
      name: name, 
      prices: prices 
    };

    // Simpan ke Firestore
    await setDoc(docRef, newItemData);
    
    // Return dengan format ID number agar sesuai dengan state React kamu
    return { id: newId, ...newItemData };
  } catch (error) {
    console.error("Error adding menu item to Firestore:", error);
    throw error;
  }
}

// ==========================================
// 4. TAMBAH KATEGORI BARU
// ==========================================
export async function addCategory(name) {
  try {
    const newId = Date.now();
    const docRef = doc(db, 'categories', newId.toString());
    
    const newCategoryData = { 
      name: name.toUpperCase(),
      display_order: 99 // Nilai default display_order agar berada di urutan bawah
    };

    await setDoc(docRef, newCategoryData);
    
    return { id: newId, category: newCategoryData.name, items: [] };
  } catch (error) {
    console.error("Error adding category to Firestore:", error);
    throw error;
  }
}

// ==========================================
// 5. PENYELAMAT COMPONENT LAMA (EXPORT SUPABASE)
// ==========================================
// Tetap ekspor objek supabase asli agar halaman Admin.jsx tidak crash saat nyari modul import-nya
export { supabase };
