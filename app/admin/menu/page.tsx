'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

type C = {
  id: string;
  name: string;
};

type P = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  active: boolean;
  sortOrder: number;
  category: C;
};

export default function AdminMenu() {
  const r = useRouter();

  const [products, setProducts] = useState<P[]>([]);
  const [categories, setCategories] = useState<C[]>([]);
  const [edit, setEdit] = useState<P | null>(null);

  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const x = await fetch('/api/admin/products', {
        cache: 'no-store',
      });

      if (x.status === 401) {
        r.push('/admin/login');
        return;
      }

      const d = await x.json();

      if (!x.ok) {
        throw new Error(
          d.error || 'Unable to load menu'
        );
      }

      setProducts(d.products || []);
      setCategories(d.categories || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load menu'
      );
    }
  }, [r]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadImage(file: File) {
    setError('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Only JPG, PNG and WebP images are allowed.'
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });

      if (res.status === 401) {
        r.push('/admin/login');
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error || 'Image upload failed'
        );
      }

      setImageUrl(result.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Image upload failed'
      );
    } finally {
      setUploading(false);
    }
  }

  async function save(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (uploading || saving) {
      return;
    }

    setError('');
    setSaving(true);

    const form = e.currentTarget;
    const f = new FormData(form);

    const payload = {
      ...(edit ? { id: edit.id } : {}),

      name: String(f.get('name') || '').trim(),

      description: String(
        f.get('description') || ''
      ).trim(),

      price: Number(f.get('price')),

      imageUrl: imageUrl || null,

      categoryId: String(
        f.get('categoryId') || ''
      ),

      active: f.get('active') === 'on',

      sortOrder: Number(
        f.get('sortOrder') || 0
      ),
    };

    try {
      const x = await fetch('/api/admin/products', {
        method: edit ? 'PATCH' : 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(payload),
      });

      if (x.status === 401) {
        r.push('/admin/login');
        return;
      }

      const d = await x.json();

      if (!x.ok) {
        throw new Error(
          d.error || 'Unable to save product'
        );
      }

      form.reset();

      setEdit(null);
      setImageUrl('');
      setError('');

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save product'
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product: P) {
    setEdit(product);
    setImageUrl(product.imageUrl || '');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function cancelEdit() {
    setEdit(null);
    setImageUrl('');
    setError('');
  }

  return (
    <>
      <section className="admin-hero">
        <div className="wrap admin-hero-row">
          <div>
            <div className="eyebrow light">
              MENU CONTROL
            </div>

            <h1>Menu Manager</h1>

            <p>
              Add products, update prices,
              change images or hide unavailable
              items.
            </p>
          </div>

          <div className="admin-actions">
            <button
              className="btn btn-light"
              onClick={() =>
                r.push('/admin/orders')
              }
            >
              ← Orders
            </button>
          </div>
        </div>
      </section>

      <main className="wrap content admin-shell">
        <div className="admin-menu-layout">
          <form
            className="card admin-form"
            onSubmit={save}
          >
            <div className="eyebrow">
              {edit
                ? 'EDIT PRODUCT'
                : 'NEW PRODUCT'}
            </div>

            <h2>
              {edit
                ? 'Update menu item'
                : 'Add a menu item'}
            </h2>

            <label className="form-label">
              Product name{' '}
              <span className="required">
                *
              </span>

              <input
                className="input"
                name="name"
                required
                defaultValue={edit?.name || ''}
                key={'n' + (edit?.id || 'new')}
              />
            </label>

            <label className="form-label">
              Description{' '}
              <span className="optional">
                (Optional)
              </span>

              <textarea
                className="input"
                name="description"
                rows={3}
                defaultValue={
                  edit?.description || ''
                }
                key={'d' + (edit?.id || 'new')}
              />
            </label>

            <div className="form-two">
              <label className="form-label">
                Price (Rs){' '}
                <span className="required">
                  *
                </span>

                <input
                  className="input"
                  type="number"
                  min="1"
                  name="price"
                  required
                  defaultValue={edit?.price || ''}
                  key={'p' + (edit?.id || 'new')}
                />
              </label>

              <label className="form-label">
                Category{' '}
                <span className="required">
                  *
                </span>

                <select
                  className="input"
                  name="categoryId"
                  required
                  defaultValue={
                    edit?.categoryId ||
                    categories[0]?.id ||
                    ''
                  }
                  key={'c' + (edit?.id || 'new')}
                >
                  {categories.map((c) => (
                    <option
                      value={c.id}
                      key={c.id}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form-label">
              Product image{' '}
              <span className="optional">
                (Optional)
              </span>

              <input
                className="input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading || saving}
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadImage(file);
                  }
                }}
              />

              <small>
                JPG, PNG or WebP. Maximum 5MB.
              </small>

              {uploading && (
                <small
                  style={{
                    display: 'block',
                    marginTop: 8,
                  }}
                >
                  Uploading image...
                </small>
              )}

              {imageUrl && (
                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={
                      edit?.name
                        ? `${edit.name} preview`
                        : 'Product preview'
                    }
                    style={{
                      width: 140,
                      height: 140,
                      objectFit: 'cover',
                      borderRadius: 12,
                    }}
                  />

                  <small
                    style={{
                      display: 'block',
                      marginTop: 6,
                    }}
                  >
                    Image ready ✓
                  </small>

                  <button
                    type="button"
                    className="btn btn-outline compact-btn"
                    style={{
                      marginTop: 8,
                    }}
                    onClick={() =>
                      setImageUrl('')
                    }
                    disabled={
                      uploading || saving
                    }
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </label>

            <input
              type="hidden"
              name="imageUrl"
              value={imageUrl}
            />

            <div className="form-two">
              <label className="form-label">
                Sort order

                <input
                  className="input"
                  type="number"
                  name="sortOrder"
                  defaultValue={
                    edit?.sortOrder || 0
                  }
                  key={'s' + (edit?.id || 'new')}
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={
                    edit?.active ?? true
                  }
                  key={'a' + (edit?.id || 'new')}
                />

                Available on menu
              </label>
            </div>

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <div className="admin-actions">
              <button
                className="btn"
                type="submit"
                disabled={uploading || saving}
              >
                {uploading
                  ? 'Uploading...'
                  : saving
                    ? 'Saving...'
                    : edit
                      ? 'Save Changes →'
                      : 'Add Product →'}
              </button>

              {edit && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={cancelEdit}
                  disabled={uploading || saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section>
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  LIVE CATALOGUE
                </div>

                <h2>
                  {products.length} products
                </h2>
              </div>
            </div>

            <div className="admin-product-list">
              {products.map((p) => (
                <article
                  className="card admin-product"
                  key={p.id}
                >
                  <div>
                    <span
                      className={
                        'status-chip ' +
                        (p.active
                          ? 'status-good'
                          : 'status-off')
                      }
                    >
                      {p.active
                        ? 'Available'
                        : 'Hidden'}
                    </span>

                    <h3>{p.name}</h3>

                    <p>
                      {p.category.name} • Rs{' '}
                      {p.price}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline compact-btn"
                    onClick={() =>
                      startEdit(p)
                    }
                  >
                    Edit
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}