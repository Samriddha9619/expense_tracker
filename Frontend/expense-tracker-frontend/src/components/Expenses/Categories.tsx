import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { expensesAPI } from '../../api/expenses';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await expensesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await expensesAPI.updateCategory(editingCategory.id, formData);
      } else {
        await expensesAPI.createCategory(formData);
      }
      setFormData({ name: '', description: '', color: '#007bff' });
      setEditingCategory(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await expensesAPI.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading) return <div className="container">Loading categories...</div>;

  return (
    <div className="container">
      <h2 className="pageTitle">Categories</h2>
      <button onClick={() => setShowForm(!showForm)} className="btn btn--primary" style={{marginBottom:16}}>
        {showForm ? 'Cancel' : 'Add Category'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form" style={{ marginBottom: 16 }}>
          <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div style={{ marginBottom: 14 }}>
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Color:</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              style={{ marginTop: '5px' }}
            />
          </div>
          <button type="submit" className="btn btn--success" style={{marginRight:8}}>
            {editingCategory ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => {
              setShowForm(false);
              setEditingCategory(null);
              setFormData({ name: '', description: '', color: '#007bff' });
            }}>
            Cancel
          </button>
        </form>
      )}

      <div className="grid" style={{gap:12}}>
        {categories.map((category) => (
          <div key={category.id} className="listItem">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span className="dot" style={{background: category.color}} />
              <div>
                <h4 className="listTitle" style={{marginBottom:4}}>{category.name}</h4>
                <p className="muted" style={{margin:'0 0 8px 0'}}>
                  {category.description || 'No description'}
                </p>
                <div className="muted" style={{fontSize:14}}>
                  <span>Transactions: {category.transaction_count}</span>
                  <span style={{ marginLeft: '20px' }}>Total Spent: ₹{category.total_spent}</span>
                </div>
              </div>
            </div>
            <div>
              <button onClick={() => handleEdit(category)} className="btn" style={{marginRight:8}}>Edit</button>
              <button onClick={() => handleDelete(category.id)} className="btn btn--danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
