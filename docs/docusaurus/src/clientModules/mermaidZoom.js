import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  let overlayEl = null;
  let cleanupDrag = null;

  const closeModal = () => {
    if (!overlayEl) return;
    overlayEl.remove();
    overlayEl = null;
    document.removeEventListener('keydown', onKeyDown);
    if (cleanupDrag) {
      cleanupDrag();
      cleanupDrag = null;
    }
  };

  function onKeyDown(event) {
    if (event.key === 'Escape') closeModal();
  }

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const SCALE_STEP = 0.25;

  const openModal = (svgEl) => {
    closeModal();

    let scale = 1;

    overlayEl = document.createElement('div');
    overlayEl.className = 'mermaid-zoom-overlay';

    // 閉じるボタン・ツールバーはスクロール領域の外に置き、
    // パン/ズーム中も常に押せる状態を保つ
    const content = document.createElement('div');
    content.className = 'mermaid-zoom-content';

    const toolbar = document.createElement('div');
    toolbar.className = 'mermaid-zoom-toolbar';

    const zoomOutButton = document.createElement('button');
    zoomOutButton.type = 'button';
    zoomOutButton.className = 'mermaid-zoom-btn';
    zoomOutButton.setAttribute('aria-label', '縮小');
    zoomOutButton.textContent = '－';

    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'mermaid-zoom-label';

    const zoomInButton = document.createElement('button');
    zoomInButton.type = 'button';
    zoomInButton.className = 'mermaid-zoom-btn';
    zoomInButton.setAttribute('aria-label', '拡大');
    zoomInButton.textContent = '＋';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'mermaid-zoom-btn mermaid-zoom-reset';
    resetButton.setAttribute('aria-label', '倍率をリセット');
    resetButton.textContent = 'リセット';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'mermaid-zoom-close';
    closeButton.setAttribute('aria-label', '閉じる');
    closeButton.textContent = '×';

    const scrollArea = document.createElement('div');
    scrollArea.className = 'mermaid-zoom-scroll-area';

    const svgClone = svgEl.cloneNode(true);
    // 元のSVGはインラインstyle/width/heightで小さいサイズに固定されているため、
    // CSSで拡大できるように取り除く
    svgClone.removeAttribute('style');
    svgClone.removeAttribute('width');
    svgClone.removeAttribute('height');

    const svgWrap = document.createElement('div');
    svgWrap.className = 'mermaid-zoom-svg-wrap';
    svgWrap.appendChild(svgClone);

    const updateScale = () => {
      svgWrap.style.transform = `scale(${scale})`;
      zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    };
    updateScale();

    zoomInButton.addEventListener('click', () => {
      scale = Math.min(MAX_SCALE, Math.round((scale + SCALE_STEP) * 100) / 100);
      updateScale();
    });
    zoomOutButton.addEventListener('click', () => {
      scale = Math.max(MIN_SCALE, Math.round((scale - SCALE_STEP) * 100) / 100);
      updateScale();
    });
    resetButton.addEventListener('click', () => {
      scale = 1;
      updateScale();
      scrollArea.scrollLeft = 0;
      scrollArea.scrollTop = 0;
    });

    // ドラッグでのパン操作
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let scrollStartLeft = 0;
    let scrollStartTop = 0;

    scrollArea.addEventListener('mousedown', (event) => {
      isDragging = true;
      scrollArea.classList.add('mermaid-zoom-grabbing');
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      scrollStartLeft = scrollArea.scrollLeft;
      scrollStartTop = scrollArea.scrollTop;
      event.preventDefault();
    });

    const onMouseMove = (event) => {
      if (!isDragging) return;
      scrollArea.scrollLeft = scrollStartLeft - (event.clientX - dragStartX);
      scrollArea.scrollTop = scrollStartTop - (event.clientY - dragStartY);
    };
    const stopDragging = () => {
      isDragging = false;
      scrollArea.classList.remove('mermaid-zoom-grabbing');
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDragging);
    cleanupDrag = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
    };

    toolbar.appendChild(zoomOutButton);
    toolbar.appendChild(zoomLabel);
    toolbar.appendChild(zoomInButton);
    toolbar.appendChild(resetButton);

    scrollArea.appendChild(svgWrap);

    content.appendChild(closeButton);
    content.appendChild(toolbar);
    content.appendChild(scrollArea);
    overlayEl.appendChild(content);

    overlayEl.addEventListener('mousedown', (event) => {
      if (event.target === overlayEl) {
        closeModal();
      }
    });
    closeButton.addEventListener('click', closeModal);

    document.body.appendChild(overlayEl);
    document.addEventListener('keydown', onKeyDown);
  };

  document.addEventListener('click', (event) => {
    const container = event.target.closest('.docusaurus-mermaid-container');
    if (container) {
      const svg = container.querySelector('svg');
      if (svg) {
        openModal(svg);
      }
    }
  });
}

export default {};
