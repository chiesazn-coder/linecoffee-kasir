import { supabase } from './supabase';

// 1. Ambil semua menu (Sudah ada)
export async function fetchMenu() {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      category:name,
      items:menu_items(id, name, prices, category_id)
    `)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

// 2. Update harga (Sudah ada)
export async function updateMenuItemPrice(itemName, newPrices) {
  const { error } = await supabase
    .from('menu_items')
    .update({ prices: newPrices })
    .eq('name', itemName);
    
  if (error) throw error;
}

// 3. TAMBAHKAN INI: Fungsi untuk Tambah Item Baru
export async function addMenuItem(categoryId, name, prices) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([{ 
      category_id: categoryId, 
      name: name, 
      prices: prices 
    }])
    .select();
    
  if (error) throw error;
  return data[0];
}

// 4. (Opsional) Langsung tambahkan export supabase jika Admin.jsx membutuhkannya
export { supabase };

// Tambah kategori baru
export async function addCategory(name) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: name.toUpperCase() }])
    .select();
    
  if (error) throw error;
  return data[0];
}