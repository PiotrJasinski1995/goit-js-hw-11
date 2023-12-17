import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'modern-normalize/modern-normalize.css';

const form = document.querySelector('.search-form');
const input = document.querySelector('input');
const apiKey = '41284992-e3e58fe867fcadc7d8005ce00';
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

let page = 1;
let isFirstSearch = true;

const photosPerPage = 40;

loadMoreBtn.hidden = true;

const fetchImg = async currentPage => {
  try {
    let searchParams = new URLSearchParams({
      key: apiKey,
      q: input.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: currentPage,
      per_page: photosPerPage,
    });

    let photos = [];

    if (input.value) {
      const response = await axios.get(
        `https://pixabay.com/api/?${searchParams}`
      );

      photos = response.data.hits;

      const totalPhotosHits = response.data.totalHits;

      const imageString = totalPhotosHits === 1 ? 'image' : 'images';

      if (isFirstSearch) {
        Notiflix.Notify.info(
          `Hooray! We found ${totalPhotosHits} ${imageString}.`
        );
      }

      loadMoreBtn.hidden = false;
    }

    if (photos.length === 0) {
      loadMoreBtn.hidden = true;

      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (photos.length > 0 && photos.length < photosPerPage) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );

      loadMoreBtn.hidden = true;
    }

    const photosArray = photos.map(image => ({
      webformatURL: image.webformatURL,
      largeImageURL: image.largeImageURL,
      tags: image.tags,
      likes: image.likes,
      views: image.views,
      comments: image.comments,
      downloads: image.downloads,
    }));

    return photosArray;
  } catch (error) {
    throw error;
  }
};

const fetchAndRenderImg = async currentPage => {
  try {
    const photos = await fetchImg(currentPage);
    gallery.innerHTML += photos
      .map(
        item => `
        <div class="photo-card gallery-item">
          <a href="${item.largeImageURL}" class="gallery-link">
            <img src="${item.largeImageURL}" alt="${item.tags}" loading="lazy" class="gallery-image" />
            <div class="info">
              <div class="info-detail">
                <p><b>Likes:</b></p>
                <p>${item.likes}</p>
              </div>
              <div class="info-detail">
                <p><b>Views:</b></p>
                <p>${item.views}</p>
              </div>
              <div class="info-detail">
                <p><b>Comments:</b></p>
                <p>${item.comments}</p>
              </div>
              <div class="info-detail">
                <p><b>Downloads:</b></p>
                <p>${item.downloads}</p>
              </div>
            </div>
          </a>
        </div>
      `
      )
      .join('');

    const lightbox = new SimpleLightbox('.gallery a');

    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

form.addEventListener('submit', async event => {
  event.preventDefault();
  isFirstSearch = true;
  page = 1;
  gallery.innerHTML = '';
  fetchAndRenderImg(page);
});

loadMoreBtn.addEventListener('click', _event => {
  isFirstSearch = false;
  page++;
  fetchAndRenderImg(page);
});
