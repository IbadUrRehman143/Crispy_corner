'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
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

  const load = useCallback(async () => {
    const x = await fetch('/api/admin/products', {
      cache: 'no-store',
    });

    if (x.status === 401) {
      return r.push('/admin/login');
    }

    const d = await x.json();

    setProducts(d.products || []);
    setCategories(d.categories || []);
  }, [r]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // FIX:
    // Capture form before await.
    const form = e.currentTarget;

    const f = new FormData(form);

    const payload = {
      ...(edit ? { id: edit.id } : {}),

      name: String(f.get('name')),

      description: String(
        f.get('description') || ''
      ),

      price: Number(f.get('price')),

      imageUrl:
        String(f.get('imageUrl') || '') || null,

      categoryId: String(
        f.get('categoryId')
      ),

      active:
        f.get('active') === 'on',

      sortOrder: Number(
        f.get('sortOrder') || 0
      ),
    };

    const x = await fetch(
      '/api/admin/products',
      {
        method: edit ? 'PATCH' : 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(payload),
      }
    );

    if (!x.ok) {
      setError(
        (await x.json()).error ||
          'Could not save product'
      );

      return;
    }

    setEdit(null);
    setError('');

    // FIX:
    // Don't use e.currentTarget after await.
    form.reset();

    await load();
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
                defaultValue={edit?.name}
                key={'n' + edit?.id}
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
                  edit?.description
                }
                key={'d' + edit?.id}
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
                  defaultValue={edit?.price}
                  key={'p' + edit?.id}
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
                    edit?.categoryId
                  }
                  key={'c' + edit?.id}
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
              Image path / URL{' '}
              <span className="optional">
                (Optional)
              </span>

              <input
                className="input"
                name="imageUrl"
                placeholder="/menu/zinger-burger.webp"
                defaultValue={
                  edit?.imageUrl || ''
                }
                key={'i' + edit?.id}
              />

              <small>
                Put local images inside
                public/menu and use
                /menu/filename.webp.
              </small>
            </label>

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
                  key={'s' + edit?.id}
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={
                    edit?.active ?? true
                  }
                  key={'a' + edit?.id}
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
              >
                {edit
                  ? 'Save Changes'
                  : 'Add Product'}{' '}
                →
              </button>

              {edit && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setEdit(null)
                  }
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
                    className="btn btn-outline compact-btn"
                    onClick={() =>
                      setEdit(p)
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