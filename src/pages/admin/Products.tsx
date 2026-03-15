import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { Product, Category } from '../../types';
import { formatPrice, slugify } from '../../lib/utils';
import { Plus, Search, Filter, Edit2, Trash2, MoreVertical, X, Upload, RefreshCw } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { deleteProducts } from '../../lib/seed';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingSamples, setDeletingSamples] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    categoryId: '',
    status: 'draft',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White'],
    images: [],
    featuredImage: '',
    description: '',
    shortDescription: '',
    newArrival: false,
    featured: false,
    bestseller: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pSnap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      
      const cSnap = await getDocs(collection(db, 'categories'));
      setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(formData.name || '');
    const data = {
      ...formData,
      slug,
      updatedAt: new Date().toISOString(),
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      ratingAverage: editingProduct?.ratingAverage || 0,
      reviewCount: editingProduct?.reviewCount || 0,
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteSamples = async () => {
    setDeletingSamples(true);
    try {
      await deleteProducts();
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingSamples(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    fetchData();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Products</h1>
        <div className="flex gap-4">
          <button 
            onClick={handleDeleteSamples}
            disabled={deletingSamples}
            className="border border-red-200 text-red-600 px-6 py-3 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 size={18} className="mr-2" /> {deletingSamples ? 'Deleting...' : 'Delete All Products'}
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                price: 0,
                stock: 0,
                categoryId: '',
                status: 'draft',
                sizes: ['S', 'M', 'L'],
                colors: ['Black', 'White'],
                images: [],
                featuredImage: '',
                description: '',
                shortDescription: '',
                newArrival: false,
                featured: false,
                bestseller: false,
              });
              setIsModalOpen(true);
            }}
            className="bg-stone-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-2" /> Add New Product
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..."
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-600 flex items-center">
            <Filter size={18} className="mr-2" /> Filter
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Product</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Category</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Price</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Stock</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500">Status</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                      <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{product.name}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest">{product.sku || 'No SKU'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-stone-600">
                    {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-stone-900">{formatPrice(product.price)}</p>
                  {product.salePrice && <p className="text-[10px] text-red-500 font-bold">Sale: {formatPrice(product.salePrice)}</p>}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${product.stock < 10 ? 'text-red-500' : 'text-stone-600'}`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                    product.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setFormData(product);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-stone-400 italic">No products found.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-serif">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Product Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Price (LKR)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Stock Qty</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Category</label>
                    <select 
                      required
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 bg-white"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Short Description</label>
                    <textarea 
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 h-24"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Featured Image URL</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value, images: [e.target.value] })}
                    />
                    <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">Paste a direct image URL for now</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-4 border border-stone-200 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="accent-stone-900"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      <span className="text-xs uppercase tracking-widest font-bold">Featured</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-stone-200 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="accent-stone-900"
                        checked={formData.newArrival}
                        onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                      />
                      <span className="text-xs uppercase tracking-widest font-bold">New Arrival</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Status</label>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                        className={`flex-grow py-3 rounded-lg text-xs uppercase tracking-widest font-bold border transition-colors ${formData.status === 'draft' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-500'}`}
                      >
                        Draft
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'published' })}
                        className={`flex-grow py-3 rounded-lg text-xs uppercase tracking-widest font-bold border transition-colors ${formData.status === 'published' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-stone-200 text-stone-500'}`}
                      >
                        Published
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            const currentSizes = formData.sizes || [];
                            const newSizes = currentSizes.includes(size)
                              ? currentSizes.filter(s => s !== size)
                              : [...currentSizes, size];
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          className={`px-4 py-2 border rounded text-xs font-bold transition-colors ${
                            formData.sizes?.includes(size)
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'border-stone-200 text-stone-500 hover:border-stone-900'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Grey', 'Beige', 'Navy'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            const currentColors = formData.colors || [];
                            const newColors = currentColors.includes(color)
                              ? currentColors.filter(c => c !== color)
                              : [...currentColors, color];
                            setFormData({ ...formData, colors: newColors });
                          }}
                          className={`px-4 py-2 border rounded text-xs font-bold transition-colors ${
                            formData.colors?.includes(color)
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'border-stone-200 text-stone-500 hover:border-stone-900'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-stone-100 flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-12 py-4 bg-stone-900 text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
