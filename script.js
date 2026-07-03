document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('carousel-viewport');
  const dotsContainer = document.getElementById('carousel-dots');
  const arrowLeft = document.getElementById('arrow-left');
  const arrowRight = document.getElementById('arrow-right');
  const autoplayBtn = document.getElementById('autoplay-btn');
  const imageCounter = document.getElementById('image-counter');
  const loaderContainer = document.getElementById('loader-container');
  
  let images = [];
  let currentIndex = 0;
  let autoplayInterval = null;
  let isAutoplayActive = false;
  const autoplayDelay = 4000; // 4 secondi
  
  // Lista delle estensioni da verificare in ordine di preferenza
  const extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
  
  // Funzione per verificare l'esistenza di un file tramite fetch o oggetto Image come fallback
  async function checkFileExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      // In caso di errore CORS (es. esecuzione da file:// locale in alcuni browser)
      // proviamo con il caricamento tramite oggetto Image
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }
  }

  // Scansiona sequenzialmente le immagini nella cartella images/
  async function discoverImages() {
    let index = 1;
    let foundImages = [];
    let consecutiveFailures = 0;
    
    // Si ferma se per due numeri consecutivi non troviamo nulla (es. salti accidentali come da 002 a 004)
    while (consecutiveFailures < 2) {
      const numStr = String(index).padStart(3, '0');
      let foundInThisIndex = false;
      
      // Prova le varie estensioni per questo numero
      for (const ext of extensions) {
        const url = `images/IMG${numStr}${ext}`;
        const exists = await checkFileExists(url);
        if (exists) {
          foundImages.push(url);
          foundInThisIndex = true;
          break; // Trovato, passa al numero successivo
        }
      }
      
      if (foundInThisIndex) {
        consecutiveFailures = 0;
      } else {
        consecutiveFailures++;
      }
      index++;
    }
    
    return foundImages;
  }
  
  // Inizializza il carosello dopo aver scoperto le immagini
  async function init() {
    try {
      images = await discoverImages();
      
      // Rimuovi lo spinner
      if (loaderContainer) {
        loaderContainer.style.opacity = '0';
        setTimeout(() => loaderContainer.remove(), 500);
      }
      
      if (images.length === 0) {
        renderEmptyState();
        return;
      }
      
      renderSlides();
      renderDots();
      updateCarousel();
      setupEventListeners();
      
    } catch (error) {
      console.error("Errore durante l'inizializzazione:", error);
      renderEmptyState();
    }
  }
  
  // Mostra un messaggio di istruzioni se non ci sono immagini
  function renderEmptyState() {
    viewport.innerHTML = `
      <div class="carousel-empty">
        <h2>Nessuna foto trovata</h2>
        <p style="margin-top: 1rem; line-height: 1.6; font-size: 0.9rem;">
          Aggiungi le tue immagini verticali nella cartella <code style="color: var(--accent-color); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">images/</code> nominandole sequenzialmente:<br>
          <strong style="color: var(--text-primary);">IMG001.jpg</strong>, <strong>IMG002.jpg</strong>, <strong>IMG003.jpg</strong>, ecc.
        </p>
      </div>
    `;
    if (arrowLeft) arrowLeft.style.display = 'none';
    if (arrowRight) arrowRight.style.display = 'none';
    if (autoplayBtn) autoplayBtn.style.display = 'none';
    if (imageCounter) imageCounter.style.display = 'none';
  }
  
  // Crea gli elementi HTML per le slide
  function renderSlides() {
    viewport.innerHTML = '';
    
    images.forEach((src, idx) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      if (idx === 0) slide.classList.add('active');
      
      const img = document.createElement('img');
      // Carica la prima immagine immediatamente, lazy load per le successive
      if (idx === 0) {
        img.src = src;
      } else {
        img.dataset.src = src;
      }
      img.alt = `Ritratto ${idx + 1}`;
      
      slide.appendChild(img);
      viewport.appendChild(slide);
    });
  }
  
  // Crea i pallini
  function renderDots() {
    dotsContainer.innerHTML = '';
    images.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoplayTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }
  
  // Aggiorna la slide attiva, il pallino e il contatore
  function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        const img = slide.querySelector('img');
        if (img && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    if (imageCounter) {
      imageCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    }
  }
  
  function nextSlide() {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
  }
  
  function prevSlide() {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
  }
  
  function goToSlide(idx) {
    currentIndex = idx;
    updateCarousel();
  }
  
  // Autoplay play/pause
  function toggleAutoplay() {
    if (isAutoplayActive) {
      clearInterval(autoplayInterval);
      autoplayBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        Play
      `;
      isAutoplayActive = false;
    } else {
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
      autoplayBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        Pausa
      `;
      isAutoplayActive = true;
    }
  }
  
  function resetAutoplayTimer() {
    if (isAutoplayActive) {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }
  }
  
  // Configura i listener degli eventi
  function setupEventListeners() {
    if (arrowLeft) {
      arrowLeft.addEventListener('click', () => {
        prevSlide();
        resetAutoplayTimer();
      });
    }
    
    if (arrowRight) {
      arrowRight.addEventListener('click', () => {
        nextSlide();
        resetAutoplayTimer();
      });
    }
    
    if (autoplayBtn) {
      autoplayBtn.addEventListener('click', toggleAutoplay);
    }
    
    // Tastiera
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplayTimer();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplayTimer();
      }
    });
    
    // Touch gestures per Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 55;
      if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
        resetAutoplayTimer();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
        resetAutoplayTimer();
      }
    }
  }
  
  init();
});
