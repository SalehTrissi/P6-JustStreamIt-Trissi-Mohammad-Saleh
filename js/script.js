const api = "http://localhost:8000/api/v1/titles/";

// Fetch the best movie and update the HTML elements
async function getDataBestMovie() {
    const bestTitle = document.getElementById('top-title');
    const bestDescription = document.getElementById('top-description');
    const imgBestMovie = document.querySelector('.img-best-movie img');
    const moreInfoButton = document.getElementById('more-info-btn');

    try {
        // Fetch the data and sort it by IMDb score in descending order
        const response = await fetch(`${api}?sort_by=-imdb_score`);
        const { results } = await response.json();

        // Get the URL for the best movie
        const bestMovieUrl = results[0].url;

        // Fetch the additional details for the best movie using the URL
        const movieResponse = await fetch(bestMovieUrl);
        const movieData = await movieResponse.json();

        // Update the HTML elements with the title and description of the best movie
        bestTitle.textContent = movieData.title;
        bestDescription.textContent = movieData.description;
        imgBestMovie.src = movieData.image_url;

        moreInfoButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default behavior of scrolling to the top
            openModal(movieData.id); // Pass the ID of the movie to open the modal
        });

    } catch (error) {
        console.error(error);
    }
}

function openModal(id) {
    // Get the modal element
    const modal = document.getElementById('modal');
    modal.style.display = 'block'; // Show the modal

    // Store the current scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

    // Get the close buttons
    const closeButton = document.getElementById('close-modal-btn');

    // Fetch modal data by id
    fetchModalDataById(id);

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = 'none'; // Hide the modal

        // Restore the previous scroll position
        window.scrollTo(0, scrollPosition);
    };

    // Event listener for the close button
    closeButton.addEventListener('click', closeModal);

    // Event listener for closing the modal by clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(); // Hide the modal
        }
    });
}



async function fetchModalDataById(id) {
    try {
        const response = await fetch(api + id); // Fetch data from the API using the provided ID
        const data = await response.json(); // Parse the response as JSON

        // Update the modal elements with the fetched data

        // Update the modal cover image
        const modalCover = document.getElementById('modal-img');
        modalCover.src = data.image_url;

        // Update the modal title
        const modalTitle = document.getElementById('modal-title');
        modalTitle.innerHTML = data.title;

        // Update the modal year
        const modalYear = document.getElementById('modal-year');
        modalYear.innerHTML = data.year;

        // Update the modal rating
        const modalRating = document.getElementById('modal-rating');
        modalRating.innerHTML = data.rated;

        // Update the modal duration
        const modalDuration = document.getElementById('modal-duration');
        modalDuration.innerHTML = data.duration + " min";

        // Update the modal genres
        const modalGenres = document.getElementById('modal-genres');
        modalGenres.innerHTML = data.genres;

        // Update the modal IMDb score
        const modalImdb = document.getElementById('modal-imdb');
        modalImdb.innerHTML = data.imdb_score + " / 10";

        // Update the modal directors
        const modalDirectors = document.getElementById('modal-directors');
        modalDirectors.innerHTML = data.directors;

        // Update the modal cast
        const modalCast = document.getElementById('modal-cast');
        modalCast.innerHTML = data.actors;

        // Update the modal country
        const modalCountry = document.getElementById('modal-country');
        modalCountry.innerHTML = data.countries;

        // Update the modal box office
        const modalBoxOffice = document.getElementById('modal-box-office');
        if (data.worldwide_gross_income == null)
            modalBoxOffice.innerHTML = "N/A";  // placeholder for unspecified box-office
        else
            modalBoxOffice.innerHTML = data.worldwide_gross_income + " " + data.budget_currency;

        // Update the modal description
        const modalDescription = document.getElementById('modal-summary');
        const regExp = /[a-zA-Z]/g;
        if (regExp.test(data.long_description))
            modalDescription.innerHTML = data.long_description;
        else
            modalDescription.innerHTML = "N/A";  // placeholder for missing description

    } catch (error) {
        console.log('Error fetching modal data:', error);
        // Handle any errors that occur during the fetch request
    }
}


async function fetchTopRatedFilms() {
    try {
        // Fetch the data from the API, sorted by IMDb score in descending order
        const response = await fetch(`${api}?sort_by=-imdb_score&page_size=7`);
        const data = await response.json();

        // Extract the top rated films from the response data
        const topRatedFilms = data.results;
        return topRatedFilms; // Return the fetched movies

    } catch (error) {
        // Handle any errors that occur during the API request
        console.error(error);
        return []; // Return an empty array in case of an error
    }
}


async function fetchMoviesByGenre(genre, page) {
    const url = `${api}?sort_by=-imdb_score&genre=${genre}&page=${page}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.results; // Return the fetched movie results
    } catch (error) {
        console.error('An error occurred while fetching movies:', error);
        return []; // Return an empty array in case of an error
    }
}


async function fetchFirstSevenMoviesByGenre(genre) {
    const totalPages = Math.ceil(7 / 5); // Calculate the total number of pages required
    let movies = []; // Array to store the fetched movies

    try {
        for (let page = 1; page <= totalPages; page++) {
            const moviesOnPage = await fetchMoviesByGenre(genre, page); // Fetch movies for the current page
            const remainingSlots = 7 - movies.length; // Calculate the number of remaining slots in the movies array

            if (moviesOnPage.length <= remainingSlots) {
                // If the number of movies on the page is less than or equal to the remaining slots, add all of them
                movies.push(...moviesOnPage);
            } else {
                // Otherwise, add only the required number of movies to fill the remaining slots
                movies.push(...moviesOnPage.slice(0, remainingSlots));
            }

            if (movies.length >= 7) {
                // Break the loop if we have collected enough movies
                break;
            }
        }

        //console.log(`First 7 ${genre} movies:`, movies);
        // Show the movies on the UI or perform any other desired action

        return movies; // Return the fetched movies as a resolved promise
    } catch (error) {
        console.error('An error occurred while fetching movies:', error);
        throw error; // Throw the error to be caught by the caller
    }
}

// Function to build a carousel based on the given category, index, and movie data
async function buildCarousel(category, index, moviesData) {
    // Create a new section element
    const section = document.createElement("section");
    section.classList.add("carousel", `carousel-${index}`);

    // Create a new div for the carousel
    const carousel = document.createElement("div");
    carousel.classList.add("container");

    // Create a title for the category
    const categoryTitle = document.createElement("h1");
    categoryTitle.innerHTML = `${category}`;

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    const inner = document.createElement("div");
    inner.classList.add("inner");

    // Append the title to the carousel
    carousel.append(categoryTitle);

    // Append the wrapper to the carousel
    carousel.append(wrapper);

    // Append the inner to the wrapper
    wrapper.append(inner);

    // Append the carousel to the section
    section.append(carousel);

    // Get the div with class "carousels" in the HTML
    const carouselsDiv = document.querySelector(".carousels");

    // Append the section to the carouselsDiv
    carouselsDiv.append(section);

    let sectionId1 = `section1-${index}`; // Generate unique ID for section1
    let sectionId2 = `section2-${index}`; // Generate unique ID for section2

    let section1 = document.getElementById(sectionId1);
    let section2 = document.getElementById(sectionId2);

    // Create the desired number of cards with incremented IDs
    for (let i = 0; i < moviesData.length; i++) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.id = `card-${index}-${i + 1}`;

        const img = document.createElement("img");
        img.src = moviesData[i].image_url; // Replace with the actual image source property from the fetched movies
        img.alt = `Image ${i + 1}`;

        const content = document.createElement("div");
        content.classList.add("content");

        const h2 = document.createElement("h2");
        h2.textContent = moviesData[i].title; // Replace with the actual title property from the fetched movies

        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("button");

        const moreInfoBtn = document.createElement("a");
        moreInfoBtn.href = "#";
        moreInfoBtn.classList.add("btn-primary");
        moreInfoBtn.setAttribute("aria-label", "open modal");
        moreInfoBtn.textContent = "More info";

        // Add event listener to the "More info" button
        moreInfoBtn.addEventListener("click", () => {
            openModal(moviesData[i].id); // Pass the ID of the movie to open the modal
        });

        // Append the elements to the card
        card.append(img);
        card.append(content);
        content.append(h2);

        buttonDiv.appendChild(moreInfoBtn);
        card.appendChild(buttonDiv);

        card.addEventListener("mouseenter", () => {
            buttonDiv.style.display = "block";
        });

        card.addEventListener("mouseleave", () => {
            buttonDiv.style.display = "none";
        });

        // Determine the section and arrow buttons based on the card index
        if (i < 4) {
            // For the first four cards
            if (!section1) {
                section1 = document.createElement("section"); // Create section1 if it doesn't exist
                section1.id = sectionId1;
                inner.insertBefore(section1, inner.firstChild); // Insert as the first child of inner
            }
            section1.appendChild(card); // Append the card to section1

            // Add the ">" arrow button to section1
            if (i === 3 && !document.getElementById(`arrowBtn-${sectionId1}`)) {
                const arrowBtn = createArrowButton(sectionId2);
                section1.appendChild(arrowBtn);
            }
        } else {
            // For the remaining cards
            if (!section2) {
                section2 = document.createElement("section"); // Create section2 if it doesn't exist
                section2.id = sectionId2;
                inner.appendChild(section2); // Append as a child of inner
            }
            section2.appendChild(card); // Append the card to section2

            // Add the ">" arrow button to section2
            if (i === 6 && !document.getElementById(`arrowBtn-${sectionId2}`)) {
                const arrowBtn = createArrowButton(sectionId1);
                section2.appendChild(arrowBtn);
            }
        }
    }
}

// Function to create an arrow button with the specified target section ID
function createArrowButton(targetSectionId) {
    const arrowBtn = document.createElement("a");
    arrowBtn.href = `#${targetSectionId}`;
    arrowBtn.classList.add("arrow__btn");
    arrowBtn.textContent = "›";
    arrowBtn.setAttribute("onclick", "return false"); // Add onclick="return false"
    arrowBtn.id = `arrowBtn-${targetSectionId}`;
    return arrowBtn;
}

// Function to display the carousels on the page
async function displayCarousels() {
    try {
        const topRatedFilms = await fetchTopRatedFilms();
        const sportMoviesPromise = fetchFirstSevenMoviesByGenre("Sport", 2);
        const sciFiMoviesPromise = fetchFirstSevenMoviesByGenre("Sci-Fi", 3);
        const historyMoviesPromise = fetchFirstSevenMoviesByGenre("History", 4);

        const sportMovies = await sportMoviesPromise;
        const sciFiMovies = await sciFiMoviesPromise;
        const historyMovies = await historyMoviesPromise;

        // Build carousels for each category
        buildCarousel("Top Rated", 1, topRatedFilms);
        buildCarousel("Sport", 2, sportMovies);
        buildCarousel("Sci-Fi", 3, sciFiMovies);
        buildCarousel("History", 4, historyMovies);
    } catch (error) {
        console.error(error);
    }
}



// Call the function to fetch the data for the best movie and set up the modal
displayCarousels();
getDataBestMovie();