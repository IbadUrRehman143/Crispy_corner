'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
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

  const formRef = useRef<HTMLFormElement | null>(null);

  const [products, setProducts] = useState<P[]>([]);
  const [categories, setCategories] = useState<C[]>([]);
  const [edit, setEdit] = useState<P | null>(null);

  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteProduct, setDeleteProduct] =
    useState<P | null>(null);

  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] =
    useState(5);

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

  /*
   * Match the catalogue length approximately
   * with the Add/Edit Product form height.
   *
   * No internal scrollbar is used.
   */
  useEffect(() => {
    function calculateProductsPerPage() {
      if (!formRef.current) {
        return;
      }

      // On smaller screens the columns stack.
      if (window.innerWidth <= 1000) {
        setProductsPerPage(5);
        return;
      }

      const formHeight =
        formRef.current.offsetHeight;

      // Space used by LIVE CATALOGUE heading
      // and pagination controls.
      const reservedHeight = 125;

      const availableHeight = Math.max(
        formHeight - reservedHeight,
        250
      );

      // Approximate height of one catalogue card
      // including the gap between cards.
      const productCardHeight = 118;

      const count = Math.max(
        1,
        Math.floor(
          availableHeight / productCardHeight
        )
      );

      setProductsPerPage(count);
    }

    calculateProductsPerPage();

    const observer = new ResizeObserver(
      calculateProductsPerPage
    );

    const currentForm = formRef.current;

    if (currentForm) {
      observer.observe(currentForm);
    }

    window.addEventListener(
      'resize',
      calculateProductsPerPage
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        'resize',
        calculateProductsPerPage
      );
    };
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(
      products.length / productsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * productsPerPage;

  const visibleProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      setError(
        'Image must be 5MB or smaller.'
      );
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch(
        '/api/admin/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      if (res.status === 401) {
        r.push('/admin/login');
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.error ||
            'Image upload failed'
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
      ...(edit
        ? {
            id: edit.id,
          }
        : {}),

      name: String(
        f.get('name') || ''
      ).trim(),

      description: String(
        f.get('description') || ''
      ).trim(),

      price: Number(
        f.get('price')
      ),

      imageUrl:
        imageUrl || null,

      categoryId: String(
        f.get('categoryId') || ''
      ),

      active:
        f.get('active') === 'on',

      sortOrder: Number(
        f.get('sortOrder') || 0
      ),
    };

    try {
      const x = await fetch(
        '/api/admin/products',
        {
          method:
            edit ? 'PATCH' : 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(payload),
        }
      );

      if (x.status === 401) {
        r.push('/admin/login');
        return;
      }

      const d = await x.json();

      if (!x.ok) {
        throw new Error(
          d.error ||
            'Unable to save product'
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
    setImageUrl(
      product.imageUrl || ''
    );
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

  async function confirmDelete() {
    if (
      !deleteProduct ||
      deleting
    ) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const res = await fetch(
        '/api/admin/products',
        {
          method: 'DELETE',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            id: deleteProduct.id,
          }),
        }
      );

      if (res.status === 401) {
        r.push('/admin/login');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Unable to delete product'
        );
      }

      // If deleted product is currently
      // open in Edit mode, close Edit mode.
      if (
        edit?.id ===
        deleteProduct.id
      ) {
        setEdit(null);
        setImageUrl('');
      }

      setDeleteProduct(null);

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete product'
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* ADMIN HERO */}
      <section className="admin-hero">
        <div className="wrap admin-hero-row">
          <div>
            <div className="eyebrow light">
              MENU CONTROL
            </div>

            <h1>
              Menu Manager
            </h1>

            <p>
              Add products, update prices,
              change images or hide unavailable
              items.
            </p>
          </div>

          <div className="admin-actions">
            <button
              type="button"
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

          {/* ADD / EDIT PRODUCT */}
          <form
            ref={formRef}
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

            {/* PRODUCT NAME */}
            <label className="form-label">
              Product name{' '}
              <span className="required">
                *
              </span>

              <input
                className="input"
                name="name"
                required
                defaultValue={
                  edit?.name || ''
                }
                key={
                  'n' +
                  (edit?.id || 'new')
                }
              />
            </label>

            {/* DESCRIPTION */}
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
                key={
                  'd' +
                  (edit?.id || 'new')
                }
              />
            </label>

            {/* PRICE + CATEGORY */}
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
                  defaultValue={
                    edit?.price || ''
                  }
                  key={
                    'p' +
                    (edit?.id || 'new')
                  }
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
                  key={
                    'c' +
                    (edit?.id || 'new')
                  }
                >
                  {categories.map(
                    (category) => (
                      <option
                        value={
                          category.id
                        }
                        key={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {/* PRODUCT IMAGE */}
            <label className="form-label">
              Product image{' '}
              <span className="optional">
                (Optional)
              </span>

              <input
                className="input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  uploading || saving
                }
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadImage(file);
                  }
                }}
              />

              <small>
                JPG, PNG or WebP.
                Maximum 5MB.
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
                      objectFit:
                        'contain',
                      objectPosition:
                        'center',
                      borderRadius: 12,
                      display: 'block',
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
                      uploading ||
                      saving
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

            {/* SORT + AVAILABILITY */}
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
                  key={
                    's' +
                    (edit?.id || 'new')
                  }
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={
                    edit?.active ?? true
                  }
                  key={
                    'a' +
                    (edit?.id || 'new')
                  }
                />

                Available on menu
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            {/* FORM ACTIONS */}
            <div className="admin-actions">
              <button
                className="btn"
                type="submit"
                disabled={
                  uploading || saving
                }
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
                  disabled={
                    uploading ||
                    saving
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* LIVE CATALOGUE */}
          <section>
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  LIVE CATALOGUE
                </div>

                <h2>
                  {products.length}{' '}
                  products
                </h2>
              </div>
            </div>

            <div className="admin-product-list">
              {visibleProducts.map(
                (p) => (
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

                      <h3>
                        {p.name}
                      </h3>

                      <p>
                        {
                          p.category
                            .name
                        }
                        {' • Rs '}
                        {p.price}
                      </p>
                    </div>

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-outline compact-btn"
                        onClick={() =>
                          startEdit(p)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn compact-btn"
                        style={{
                          background:
                            '#b91c1c',
                          color: '#fff',
                        }}
                        onClick={() =>
                          setDeleteProduct(
                            p
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 18,
                }}
              >
                {/* PREVIOUS */}
                <button
                  type="button"
                  className="btn btn-outline compact-btn"
                  disabled={
                    safePage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  aria-label="Previous page"
                >
                  ←
                </button>

                {/* PAGE NUMBERS */}
                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    aria-label={`Page ${page}`}
                    aria-current={
                      page === safePage
                        ? 'page'
                        : undefined
                    }
                    style={{
                      minWidth: 38,
                      height: 38,
                      padding:
                        '0 10px',
                      borderRadius:
                        999,
                      border:
                        page ===
                        safePage
                          ? '1px solid #171414'
                          : '1px solid #d8d2cc',
                      background:
                        page ===
                        safePage
                          ? '#171414'
                          : '#fff',
                      color:
                        page ===
                        safePage
                          ? '#fff'
                          : '#171414',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor:
                        'pointer',
                    }}
                  >
                    {page}
                  </button>
                ))}

                {/* NEXT */}
                <button
                  type="button"
                  className="btn btn-outline compact-btn"
                  disabled={
                    safePage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            )}

            {/* PAGE INFO */}
            {products.length > 0 && (
              <p
                style={{
                  textAlign: 'center',
                  margin:
                    '12px 0 0',
                  color: '#6c6561',
                  fontSize: 12,
                  fontWeight: 400,
                }}
              >
                Showing{' '}
                {startIndex + 1}–
                {Math.min(
                  startIndex +
                    productsPerPage,
                  products.length
                )}{' '}
                of {products.length}
              </p>
            )}
          </section>
        </div>
      </main>

      {/* CUSTOM DELETE CONFIRMATION */}
      {deleteProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background:
              'rgba(0, 0, 0, 0.58)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            backdropFilter:
              'blur(3px)',
          }}
          onClick={() => {
            if (!deleting) {
              setDeleteProduct(null);
            }
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 390,
              padding: 24,
              borderRadius: 18,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="eyebrow"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing:
                  '0.08em',
              }}
            >
              DELETE PRODUCT
            </div>

            <h2
              style={{
                margin:
                  '8px 0 6px',
                fontSize: 20,
                lineHeight: 1.3,
                fontWeight: 600,
              }}
            >
              Delete{' '}
              {deleteProduct.name}?
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.55,
                fontWeight: 400,
                opacity: 0.72,
              }}
            >
              This product will be
              permanently removed from the
              menu. This action cannot be
              undone.
            </p>

            <div
              className="admin-actions"
              style={{
                marginTop: 20,
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                disabled={deleting}
                onClick={() =>
                  setDeleteProduct(
                    null
                  )
                }
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding:
                    '10px 16px',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn"
                disabled={deleting}
                onClick={
                  confirmDelete
                }
                style={{
                  background:
                    '#b91c1c',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                  padding:
                    '10px 16px',
                }}
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}