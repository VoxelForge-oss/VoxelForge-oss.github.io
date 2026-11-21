(() => {
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const fileMeta = document.getElementById('fileMeta');
  const fileName = document.getElementById('fileName');
  const slider = document.getElementById('scaleSlider');
  const number = document.getElementById('scaleNumber');
  const scaleReadout = document.getElementById('scaleReadout');
  const scaleMode = document.getElementById('scaleMode');
  const modeLabel = document.getElementById('modeLabel');
  const scaleHint = document.getElementById('scaleHint');
  const preview = document.getElementById('preview');
  const ctx = preview.getContext('2d');
  const emptyPreview = document.getElementById('emptyPreview');
  const dimensions = document.getElementById('dimensions');
  const sourceDimensions = document.getElementById('sourceDimensions');
  const outputDimensions = document.getElementById('outputDimensions');
  const downloadButton = document.getElementById('downloadButton');

  let sourceImage = null;
  let sourceFileName = 'pixel-art';
  let currentObjectUrl = null;

  function setScale(rawValue) {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) return;
    const value = Math.min(16, Math.max(1, parsed));
    slider.value = String(value);
    number.value = String(value);
    scaleReadout.textContent = value + '×';
    render();
  }

  function render() {
    if (!sourceImage) return;
    const scale = Number(slider.value);
    // The switch changes the actual resize calculation, not just its label.
    const downscaling = scaleMode.checked;
    const width = downscaling
      ? Math.max(1, Math.round(sourceImage.naturalWidth / scale))
      : sourceImage.naturalWidth * scale;
    const height = downscaling
      ? Math.max(1, Math.round(sourceImage.naturalHeight / scale))
      : sourceImage.naturalHeight * scale;

    // Prevent accidentally allocating an excessively large canvas.
    if (width * height > 100000000) {
      dimensions.textContent = 'Output is too large';
      outputDimensions.textContent = 'Output: too large to render';
      downloadButton.disabled = true;
      return;
    }

    preview.width = width;
    preview.height = height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(sourceImage, 0, 0, width, height);

    preview.style.display = 'block';
    emptyPreview.style.display = 'none';
    dimensions.textContent = width + ' × ' + height + ' px';
    sourceDimensions.textContent = 'Original: ' + sourceImage.naturalWidth + ' × ' + sourceImage.naturalHeight + ' px';
    outputDimensions.textContent = 'Output: ' + width + ' × ' + height + ' px';
    downloadButton.disabled = false;
  }

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      sourceImage = image;
      sourceFileName = file.name.replace(/\.[^.]+$/, '') || 'pixel-art';
      fileName.textContent = file.name;
      fileMeta.classList.add('visible');
      render();
    };
    image.onerror = () => {
      alert('That image could not be opened. Please try another file.');
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    };
    image.src = currentObjectUrl;
  }

  fileInput.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    loadFile(file);
    event.target.value = '';
  });

  ['dragenter', 'dragover'].forEach(type => {
    dropZone.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(type => {
    dropZone.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });
  dropZone.addEventListener('drop', event => {
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    loadFile(file);
  });

  scaleMode.addEventListener('change', () => {
    const downscaling = scaleMode.checked;
    modeLabel.textContent = downscaling ? 'Downscale' : 'Upscale';
    scaleHint.textContent = downscaling
      ? 'Reduces each image dimension by the selected factor using nearest-neighbour interpolation.'
      : 'Enlarges each image dimension by the selected factor using nearest-neighbour interpolation to keep pixels sharp.';
    render();
  });

  slider.addEventListener('input', () => setScale(slider.value));
  number.addEventListener('input', () => {
    if (number.value !== '') setScale(number.value);
  });
  number.addEventListener('change', () => {
    if (number.value === '') setScale(slider.value);
    else setScale(number.value);
  });

  downloadButton.addEventListener('click', () => {
    if (!sourceImage || downloadButton.disabled) return;
    preview.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sourceFileName + '-' + slider.value + 'x-' + (scaleMode.checked ? 'downscaled' : 'upscaled') + '.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  });
})();
