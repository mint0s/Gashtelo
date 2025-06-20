// Search button alert for testing (optional)


// Search functionality
function search() {
  const location = document.getElementById('location').value.trim();
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const guests = document.getElementById('guests').value;

  window.location.href = `results.html?location=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&guests=${encodeURIComponent(guests)}`;
}

// Handle property form submission
const form = document.getElementById('propertyForm');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
let coverImageIndex = 0; // default to first image

if (imageUpload && imagePreview) {
  imageUpload.addEventListener('change', function () {
    imagePreview.innerHTML = ''; // clear existing previews

    Array.from(this.files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '10px';

        wrapper.innerHTML = `
          <img src="${e.target.result}" data-index="${index}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 6px;" />
          <button type="button" class="set-cover" data-index="${index}" style="display: block; margin-top: 5px;">
            ${index === 0 ? '✔ Cover' : 'Set as Cover'}
          </button>
        `;

        imagePreview.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });
  });

  // ✅ CORRECT: Add listener once, outside the loop
  imagePreview.addEventListener('click', function (e) {
    if (e.target.classList.contains('set-cover')) {
      coverImageIndex = Number(e.target.dataset.index);
      document.querySelectorAll('.set-cover').forEach((btn, i) => {
        btn.textContent = i === coverImageIndex ? '✔ Cover' : 'Set as Cover';
      });
    }
  });
}

const successMsg = document.getElementById('successMsg');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = form[0].value;
    const location = form[1].value;
    const price = form[2].value;
    const guests = form[3].value;
    const description = form[4].value;
    const imageFiles = form[5].files;

    if (imageFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const imagePromises = Array.from(imageFiles).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

     Promise.all(imagePromises).then(images => {
      const coverImage = images[coverImageIndex]; // ✅ use selected cover

      const data = {
        title,
        location,
        price,
        guests,
        description,
        images,
        image: coverImage // ✅ this shows on the results page
      };

     fetch('https://gashtelo-production.up.railway.app/api/properties', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(res => {
        if (res.ok) {
          successMsg.style.display = 'block';
          form.reset();
        } else {
          alert("Failed to submit property.");
        }
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Something went wrong!");
      });
    });
  });
}

// SMOOTH SCROLL + PAGE FADE
document.addEventListener("DOMContentLoaded", function () {
  const scrollArrow = document.getElementById("scrollArrow");
  const section2 = document.getElementById("section2");

  if (scrollArrow && section2) {
    scrollArrow.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: section2.offsetTop,
        behavior: "smooth"
      });
    });

    const revealOnScroll = () => {
      const rect = section2.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight - 100) {
        section2.classList.add("visible");
        window.removeEventListener("scroll", revealOnScroll);
      }
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();
  }
});

// Page fade in
requestAnimationFrame(() => {
  document.body.classList.add("ready");
});

  
// Fade in hero-transition on scroll
document.addEventListener("DOMContentLoaded", function () {
  const section2 = document.getElementById("section2");

  if (!section2) return; // ✅ Prevent error if section2 doesn't exist

  const revealOnScroll = () => {
    const rect = section2.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight - 100) {
      section2.classList.add("visible");
      window.removeEventListener("scroll", revealOnScroll);
    }
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Run once in case it's already visible
});

if (window.location.pathname.includes("results.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const locationQuery = urlParams.get('location')?.toLowerCase();
  const guestQuery = parseInt(urlParams.get('guests'), 10);
  const resultsTitle = document.getElementById("resultsTitle");

if (resultsTitle && locationQuery) {
  resultsTitle.textContent = `Results for "${locationQuery}"`;
}


  async function loadFilteredProperties() {
    try {
      const res = await fetch('https://gashtelo-production.up.railway.app/api/properties');
      const properties = await res.json();
      const container = document.getElementById('propertyContainer');
      container.innerHTML = '';

      const filtered = properties.filter(prop =>
        prop.location.toLowerCase().includes(locationQuery) &&
        (!guestQuery || prop.guests >= guestQuery)
      );

      if (filtered.length === 0) {
        container.innerHTML = `
  <div class="no-results">
    <h3>No matches found</h3>
    <p>Try adjusting your filters or searching a different location.</p>
    <a href="index.html" class="back-home">Start a new search</a>
  </div>
`;

        return;
      }

      filtered.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
         <img src="${prop.image || (prop.images && prop.images[0]) || 'img/fallback.png'}" alt="Property image">
          <div class="card-details">
            <h3>${prop.title}</h3>
            <p><strong>Location:</strong> ${prop.location}</p>
            <p><strong>Guests:</strong> up to ${prop.guests}</p>
            <p><strong>Price:</strong> $${prop.price} per night</p>
            <p>${prop.description}</p>
            <a href="property.html?id=${prop._id}&location=${encodeURIComponent(locationQuery)}&guests=${guestQuery}">
            <button>View Details</button>
            </a>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  }

  loadFilteredProperties();
}
// ========== Property Details Page Logic ==========
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("propertyDetails");
  const id = new URLSearchParams(window.location.search).get("id");

  if (container && id) {
    fetch("https://gashtelo-production.up.railway.app/api/properties")
      .then((res) => res.json())
      .then((properties) => {
        const property = properties.find((p) => p._id === id);
        if (!property) {
          container.innerHTML = "<p>Property not found.</p>";
          return;
        }

container.innerHTML = `
  <div class="image-gallery">
    <button class="nav-button" id="prevBtn">&#8592;</button>
<img id="mainImage" src="${property.image || property.images?.[0] || 'img/fallback.png'}" alt="Main Image" />
    <button class="nav-button" id="nextBtn">&#8594;</button>
    <div class="thumbnail-row">
      ${property.images?.length
        ? property.images.map((img, index) => `
            <img src="${img || 'img/fallback.png'}" class="thumbnail" data-index="${index}" />
          `).join('')
        : `<img src="img/fallback.png" class="thumbnail" />`
      }
    </div>
  </div>

          <div class="details">
            <h2>${property.title}</h2>
            <p><strong>Location:</strong> ${property.location}</p>
            <p><strong>Guests:</strong> up to ${property.guests}</p>
            <p><strong>Price:</strong> $${property.price} per night</p>
            <p><strong>Description:</strong> ${property.description}</p>
            <button onclick="alert('Booking feature coming soon!')">Book This Place</button>
          </div>
        `;

        let currentIndex = property.images.findIndex(img => img === property.image);
        if (currentIndex === -1) currentIndex = 0;
        const mainImage = document.getElementById("mainImage");
        const thumbnails = document.querySelectorAll(".thumbnail");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        function showImage(index) {
          currentIndex = index;
          mainImage.src = property.images[index];
        }

        thumbnails.forEach((thumb, idx) => {
          thumb.addEventListener("click", () => showImage(idx));
        });

        prevBtn.addEventListener("click", () => {
          const newIndex = (currentIndex - 1 + property.images.length) % property.images.length;
          showImage(newIndex);
        });

        nextBtn.addEventListener("click", () => {
          const newIndex = (currentIndex + 1) % property.images.length;
          showImage(newIndex);
        });

        // Lightbox
        const lightbox = document.getElementById("lightbox");
        const lightboxImage = document.getElementById("lightboxImage");
        const closeBtn = document.querySelector(".close-btn");

        mainImage.addEventListener("click", () => {
          lightboxImage.src = property.images[currentIndex];
          lightbox.classList.remove("hidden");
        });

        closeBtn.addEventListener("click", () => {
          lightbox.classList.add("hidden");
        });

        lightbox.addEventListener("click", (e) => {
          if (e.target === lightbox) {
            lightbox.classList.add("hidden");
          }
        });
      })
      .catch((err) => {
        console.error("Error loading property:", err);
        container.innerHTML = "<p>Error loading property.</p>";
      });
  }
});
document.querySelectorAll("a[href]").forEach(link => {
  const href = link.getAttribute("href");

  if (!href.startsWith("#") && !href.startsWith("javascript")) {
    link.addEventListener("click", e => {
      e.preventDefault();

      document.body.classList.remove("ready");
      document.body.style.opacity = 0;

      setTimeout(() => {
        window.location.href = href;
      }, 400); // matches fade time
    });
  }
});
const backqueryParams = window.location.search;
if (backLink) {
  const backQueryParams = window.location.search;
  const urlParams = new URLSearchParams(backQueryParams);
  urlParams.delete("id");
  const searchParams = urlParams.toString();
  backLink.href = "results.html" + (searchParams ? "?" + searchParams : "");
}
// FEATURED PROPERTIES on Homepage
if (
  window.location.pathname === "" ||
  window.location.pathname.endsWith("/index.html")
) {

  const featuredContainer = document.getElementById("featuredProperties");

  fetch("https://gashtelo-production.up.railway.app/api/properties")
    .then(res => res.json())
    .then(properties => {
      const featured = properties.filter(p => p.featured === true).slice(0, 3);

      featured.forEach(p => {
        const card = document.createElement("div");
        card.className = "property-card";
        card.innerHTML = `
          <img src="${p.image || p.images?.[0] || 'img/fallback.png'}" alt="${p.title}">
          <div class="card-details">
            <h3>${p.title}</h3>
            <p><strong>Location:</strong> ${p.location}</p>
            <p><strong>Guests:</strong> up to ${p.guests}</p>
            <p><strong>Price:</strong> $${p.price} per night</p>
            <a href="property.html?id=${p._id}">
              <button>View Details</button>
            </a>
          </div>
        `;
        featuredContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error loading featured properties:", err);
      featuredContainer.innerHTML = "<p>Could not load featured properties.</p>";
    });
}

