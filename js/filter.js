
// *******************
// Filters Code Start
// *******************
const data = [
    { 
    //   icon: 
      image: 'img/pro-1.webp', 
      title: 'Tea', 
    //   description: 'A beautiful nature scene.' ,
      category: 'core'
    },
    { 
    //   icon: 
      image: 'img/pro-2.webp', 
      title: 'Coffee', 
    //   description: 'A beautiful nature scene.' ,
      category: 'core'
    },
    { 
    //   icon: 
      image: 'img/pro-3.webp', 
      title: 'Salt', 
    //   description: 'A beautiful nature scene.' ,
      category: 'core'
    },
    { 
      image: 'img/pro-4.webp', 
      title: 'Staples', 
    //   description: 'An adorable animal.' ,
      category: 'pantry'
    },
    { 
      image: 'img/pro-5.webp', 
      title: 'Cooking aids', 
    //   description: 'An adorable animal.' ,
      category: 'pantry'
    },
    { 
      image: 'img/pro-6.webp', 
      title: 'Dry Fruits', 
    //   description: 'An adorable animal.' ,
      category: 'pantry'
    },
    { 
      image: 'img/pro-7.webp', 
      title: 'Water/ Water-based beverages', 
    //   description: 'Another beautiful nature scene.' ,
      category: 'liquid'
    },

    { 
      image: 'img/pro-8.webp', 
      title: 'Ready-to-Drink (RTDs)', 
    //   description: 'Another beautiful nature scene.' ,
      category: 'liquid'
    },
    { 
      image: 'https://via.placeholder.com/150', 
      title: 'Breakfast, Snacks and Mini-meals', 
    //   description: 'Another beautiful nature scene.' ,
      category: 'meals'
    },
    { 
      image: 'https://via.placeholder.com/150', 
      title: 'ready to Eat (RTE)', 
    //   description: 'Another beautiful nature scene.' ,
      category: 'meals'
    },
    { 
      image: 'https://via.placeholder.com/150', 
      title: 'HORIZON 3', 
    //   description: 'Another beautiful nature scene.' ,
      category: 'horizon'
    },
    { 
      image: 'https://via.placeholder.com/150', 
      title: 'INTERNATIONAL BUSINESS BRAND PORTFOLIO', 
    //   description: 'Another beautiful nature scene.' ,
      category: 'international'
    },
  ];

  // Function to render data
  function renderData(filteredData = data) {
    const container = document.getElementById('data-container');
    container.innerHTML = '';

    filteredData.forEach(item => {
      const card = `
        <div class="col-lg-4 col-md-6 col-sm-12 pro-card-wrap">
          <div class="pro-card wow bounceInUp">
            <img src="${item.image}" class="card-img" alt="${item.title}">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text">${item.description}</p>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });
  }

  // Function to filter data
  function filterData(category) {
    const filteredData = data.filter(item => item.category.toLowerCase() === category.toLowerCase());
    renderData(filteredData);
  }

  // Initial render (show data in category 'core')
  filterData('core');

  // Event listener for filter buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');
      filterData(filter);
    });
  });
// *******************
// Filters Code End
// *******************