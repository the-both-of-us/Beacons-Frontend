'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Admin } from '@/types';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function AdminManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { account } = useAuth();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const adminsData = await api.getAdmins();
      setAdmins(adminsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newAdmin = await api.createAdmin({
        email: formData.email.trim(),
        name: formData.name.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      setAdmins((prev) => [newAdmin, ...prev]);
      setSuccessMessage(`Successfully added ${newAdmin.email} as admin`);
      setFormData({ email: '', name: '', notes: '' });
      setShowAddForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await api.deleteAdmin(email);
      setAdmins((prev) => prev.filter((admin) => admin.email !== email));
      setSuccessMessage(`Successfully removed ${email} as admin`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove admin';
      setError(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
          <p className="text-gray-600">Manage who has admin access to this application</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'outline' : 'primary'}
        >
          {showAddForm ? 'Cancel' : '+ Add Admin'}
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <Button onClick={loadAdmins} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Admin</h3>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                The user must sign in with this Google account to access admin features
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Why this person needs admin access..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || !formData.email.trim()}>
                {isSubmitting ? 'Adding...' : 'Add Admin'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="space-y-3">
        {admins.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No admins found</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{admin.email}</h3>
                    {admin.email === account?.email && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        You
                      </span>
                    )}
                  </div>

                  {admin.name && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Name:</span> {admin.name}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Added by:</span> {admin.addedBy}
                    </div>
                    <div>
                      <span className="font-medium">Added on:</span>{' '}
                      {new Date(admin.addedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {admin.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Notes:</span> {admin.notes}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleRemoveAdmin(admin.email)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={admin.email === account?.email}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Security Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Admins can manage rooms, QR codes, and other admin users</li>
          <li>• Users must sign in with Google OAuth using their admin email</li>
          <li>• You cannot remove yourself as an admin (ask another admin to do it)</li>
          <li>• All admin changes are logged with who made the change and when</li>
        </ul>
      </div>
    </div>
  );
}
