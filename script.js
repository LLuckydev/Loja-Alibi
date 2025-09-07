document.addEventListener('DOMContentLoaded', () => {
  // --- BUSCA / NAVBAR ---
  const searchToggle = document.getElementById('searchToggle');
  const searchInput  = document.getElementById('searchInput');
  const navbar       = document.querySelector('.navbar');
  const configBtn    = document.querySelector('.config-btn');
  const subBtns      = document.querySelector('.sub-btns');
  const images       = document.querySelectorAll('.efect-zoom');
  let zoomedImg = null;

  if (searchToggle && searchInput) {
    searchToggle.addEventListener('click', () => {
      searchInput.classList.toggle('active');
      if (navbar) navbar.classList.toggle('search-active');
      if (searchInput.classList.contains('active')) {
        searchInput.focus();
      } else {
        searchInput.value = '';
        clearHighlights();
      }
    });

    searchInput.addEventListener('click', () => {
      searchInput.classList.add('blink-once');
      setTimeout(() => searchInput.classList.remove('blink-once'), 1000);
    });

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query.length > 0) {
        highlightText(query);
        highlightImages(query);
        scrollToFirstHighlight();
      } else {
        clearHighlights();
      }
    });
  }

  if (configBtn && subBtns) {
    configBtn.addEventListener('click', () => {
      subBtns.classList.toggle('show');
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.efect-zoom.highlight').forEach(el => el.classList.remove('highlight'));
    document.querySelectorAll('.highlight-search').forEach(el => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }

  function highlightImages(query) {
    images.forEach(img => {
      const alt = (img.alt || '').toLowerCase();
      if (alt.includes(query)) img.classList.add('highlight');
    });
  }

  function highlightText(text) {
    clearHighlights();
    if (!text) return;

    const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    function walk(node) {
      if (node.nodeType === 3) {
        const match = node.data.match(regex);
        if (match) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;
          node.data.replace(regex, (m, i) => {
            const before = node.data.slice(lastIndex, i);
            if (before) frag.appendChild(document.createTextNode(before));
            const span = document.createElement('span');
            span.classList.add('highlight-search', 'blink-red');
            span.textContent = m;
            frag.appendChild(span);
            lastIndex = i + m.length;
            return m;
          });
          const after = node.data.slice(lastIndex);
          if (after) frag.appendChild(document.createTextNode(after));
          node.parentNode.replaceChild(frag, node);
        }
      } else if (
        node.nodeType === 1 &&
        node.childNodes &&
        !['SCRIPT','STYLE','NOSCRIPT','IFRAME','INPUT','TEXTAREA'].includes(node.tagName) &&
        !(node.closest && node.closest('.navbar'))
      ) {
        node.childNodes.forEach(child => walk(child));
      }
    }

    walk(document.body);

    setTimeout(() => {
      document.querySelectorAll('.highlight-search').forEach(el => el.classList.remove('blink-red'));
    }, 10000);
  }

  function scrollToFirstHighlight() {
    const first = document.querySelector('.highlight-search, .efect-zoom.highlight');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (images.length) {
    images.forEach(img => {
      img.addEventListener('click', () => {
        if (zoomedImg && zoomedImg !== img) zoomedImg.classList.remove('clicked');
        img.classList.toggle('clicked');
        zoomedImg = img.classList.contains('clicked') ? img : null;
      });
    });
  }

  // --- CARROSSEL (1 imagem por vez no celular, 2 no tablet, 3 no desktop) ---
  const track   = document.querySelector('.carrossel-track');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track) {
    const slides = Array.from(track.children);
    let currentIndex   = 0;
    const totalSlides  = slides.length;

    function getSlidesToShow() {
      const w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    function getGap() {
      const styles = window.getComputedStyle(track);
      const gapStr = styles.gap || styles.columnGap || '0';
      const parsed = parseFloat(gapStr);
      return Number.isFinite(parsed) ? parsed : 16;
    }

    function updateSlidePosition() {
      if (!slides.length) return;
      const slidesToShow = getSlidesToShow();
      const gap = getGap();
      const slideWidth = slides[0].getBoundingClientRect().width + gap;
      const maxIndex = totalSlides - slidesToShow;

      // Circular loop
      if (currentIndex < 0) currentIndex = maxIndex;
      if (currentIndex > maxIndex) currentIndex = 0;

      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    prevBtn?.addEventListener('click', () => {
      currentIndex--;
      updateSlidePosition();
    });

    nextBtn?.addEventListener('click', () => {
      currentIndex++;
      updateSlidePosition();
    });

    window.addEventListener('resize', () => {
      updateSlidePosition();
    });

    updateSlidePosition();
  }

  // --- NAVBAR: Scroll suave até as seções ---
  const navMap = {
    "NOVIDADES": "#novidades",
    "MODELOS": "#modelos",
    "PRODUTOS": "#produtos",
    "CONTATOS": "#contatos"
  };

  document.querySelectorAll(".nav-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const destino = navMap[btn.textContent.trim().toUpperCase()];
      if (destino) {
        const target = document.querySelector(destino);
        if (target) {
          const headerHeight = document.querySelector(".navbar").offsetHeight;
          const elementPos = target.getBoundingClientRect().top + window.scrollY;
          const offsetPos = elementPos - headerHeight;

          window.scrollTo({
            top: offsetPos,
            behavior: "smooth"
          });
        }
      }
    });
  });
});


