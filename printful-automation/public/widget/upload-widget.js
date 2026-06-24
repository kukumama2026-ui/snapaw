/**
 * Snapaw pet memorial portrait upload widget.
 *
 * Embed in the Shopify product page template (e.g. via a Custom Liquid block):
 *
 *   <div id="snapaw-upload-widget" data-api-base="https://YOUR-APP.vercel.app"></div>
 *   <script src="https://YOUR-APP.vercel.app/widget/upload-widget.js" defer></script>
 *
 * On upload, this widget calls `/api/upload` then `/api/transform` to turn
 * the photo into the chosen memorial-style portrait, then writes the result
 * into hidden inputs on the product form so they're saved as line item
 * properties on the order:
 *   properties[_customer_photo_url]
 *   properties[Memorial Style]
 */
(function () {
  const THEMES = [
    { value: 'rainbow_bridge', label: 'Rainbow Bridge' },
    { value: 'guardian_star', label: 'Guardian Among the Stars' },
    { value: 'forever_garden', label: 'Forever Garden' },
    { value: 'golden_light', label: 'Golden Light' },
    { value: 'cherished_moment', label: 'Cherished Moment' },
    { value: 'gentle_clouds', label: 'Gentle Clouds' },
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const STYLE = `
    .snapaw-upload {
      font-family: inherit;
      max-width: 420px;
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .snapaw-steps {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    .snapaw-step {
      flex: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .snapaw-step-icon { font-size: 1.6rem; line-height: 1; }
    .snapaw-step-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #333;
    }
    .snapaw-step-arrow {
      align-self: center;
      font-size: 1.2rem;
      color: #ccc;
      padding: 0 0.1rem;
    }
    .snapaw-upload label { font-weight: 600; font-size: 0.9rem; }
    .snapaw-upload select,
    .snapaw-upload input[type="file"] {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .snapaw-upload-btn {
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 4px;
      background: #111;
      color: #fff;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .snapaw-upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .snapaw-status { font-size: 0.85rem; min-height: 1.2em; }
    .snapaw-status.snapaw-error { color: #c0392b; }
    .snapaw-status.snapaw-success { color: #1e8449; }
    .snapaw-preview {
      max-width: 100%;
      margin-top: 0.5rem;
      border-radius: 4px;
      display: none;
    }
  `;

  function init() {
    const container = document.getElementById('snapaw-upload-widget');
    if (!container) return;
    const apiBase = container.dataset.apiBase;
    const form = container.closest('form[action*="/cart/add"]');

    if (!document.getElementById('snapaw-upload-style')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'snapaw-upload-style';
      styleTag.textContent = STYLE;
      document.head.appendChild(styleTag);
    }

    container.innerHTML = `
      <div class="snapaw-upload">
        <div class="snapaw-steps">
          <div class="snapaw-step">
            <span class="snapaw-step-icon">📷</span>
            <span class="snapaw-step-label">Upload Pet Photo</span>
          </div>
          <span class="snapaw-step-arrow">→</span>
          <div class="snapaw-step">
            <span class="snapaw-step-icon">🎨</span>
            <span class="snapaw-step-label">We Turn It Into Art</span>
          </div>
          <span class="snapaw-step-arrow">→</span>
          <div class="snapaw-step">
            <span class="snapaw-step-icon">📦</span>
            <span class="snapaw-step-label">Delivered To Your Door</span>
          </div>
        </div>
        <label>1. Upload your pet's photo</label>
        <input type="file" accept="image/*" class="snapaw-file-input" />
        <label>2. Choose a memorial style</label>
        <select class="snapaw-theme-select">
          ${THEMES.map((t) => `<option value="${t.value}">${t.label}</option>`).join('')}
        </select>
        <button type="button" class="snapaw-upload-btn">Upload Photo</button>
        <div class="snapaw-status"></div>
        <img class="snapaw-preview" />
      </div>
    `;

    const fileInput = container.querySelector('.snapaw-file-input');
    const themeSelect = container.querySelector('.snapaw-theme-select');
    const uploadBtn = container.querySelector('.snapaw-upload-btn');
    const status = container.querySelector('.snapaw-status');
    const preview = container.querySelector('.snapaw-preview');

    let uploadedUrl = null;

    function setStatus(message, kind) {
      status.textContent = message;
      status.classList.remove('snapaw-error', 'snapaw-success');
      if (kind) status.classList.add(kind);
    }

    // Reset upload state if the customer picks a different file.
    fileInput.addEventListener('change', () => {
      uploadedUrl = null;
      preview.style.display = 'none';
      setHiddenField('_customer_photo_url', '');
      setStatus('');
    });

    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        setStatus('Please choose a photo first.', 'snapaw-error');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setStatus('That photo is too large. Please choose one under 10MB.', 'snapaw-error');
        return;
      }

      uploadBtn.disabled = true;
      setStatus('Uploading photo...');

      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch(`${apiBase}/api/upload`, { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          throw new Error(`Upload failed with status ${uploadRes.status}`);
        }
        const uploadData = await uploadRes.json();
        if (!uploadData.url) {
          throw new Error('Upload response missing url');
        }

        setStatus('Creating your memorial portrait... this can take up to a minute.');

        const transformRes = await fetch(`${apiBase}/api/transform`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: uploadData.url, theme: themeSelect.value }),
        });
        if (!transformRes.ok) {
          throw new Error(`Transform failed with status ${transformRes.status}`);
        }
        const transformData = await transformRes.json();
        if (!transformData.url) {
          throw new Error('Transform response missing url');
        }
        uploadedUrl = transformData.url;

        preview.src = uploadedUrl;
        preview.style.display = 'block';
        setStatus('Your memorial portrait is ready! Add to cart to place your order.', 'snapaw-success');

        setHiddenField('_customer_photo_url', uploadedUrl);
        setHiddenField('Memorial Style', themeSelect.options[themeSelect.selectedIndex].text);
      } catch (err) {
        setStatus('Something went wrong creating your portrait, please try again.', 'snapaw-error');
        console.error(err);
      } finally {
        uploadBtn.disabled = false;
      }
    });

    // Block "Add to cart" until a photo has been uploaded successfully.
    if (form) {
      form.addEventListener('submit', (event) => {
        if (!uploadedUrl) {
          event.preventDefault();
          event.stopPropagation();
          setStatus('Please upload your pet\'s photo before adding to cart.', 'snapaw-error');
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    function setHiddenField(name, value) {
      if (!form) return;
      const fieldName = `properties[${name}]`;
      let input = form.querySelector(`input[name="${fieldName}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = fieldName;
        form.appendChild(input);
      }
      input.value = value;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
