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

  if (loading) return <div>Loading categories...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Categories</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        {showForm ? 'Cancel' : 'Add Category'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div style={{ marginBottom: '15px' }}>
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Color:</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              style={{ marginTop: '5px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            {editingCategory ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingCategory(null);
              setFormData({ name: '', description: '', color: '#007bff' });
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {categories.map((category) => (
          <div
            key={category.id}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: category.color }}>
                  {category.name}
                </h4>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                  {category.description || 'No description'}
                </p>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span>Transactions: {category.transaction_count}</span>
                  <span style={{ marginLeft: '20px' }}>Total Spent: ${category.total_spent}</span>
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(category)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '5px',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
