import UserTitleView from './view/user-title.js';
import NavigationView from './view/main-navigation.js';
import SortView from './view/sort-filter.js';
import FilmsView from './view/films.js';
import FilmListView from './view/film-list.js';
import EmptyList from './view/film-lsit-empty.js';
import FilmCardView from './view/film-card.js';
import ShowMoreButtonView from './view/show-more-button.js';
import FilmDetailsView from "./view/film-details.js";
import {isEscape} from './utils/common.js';
import {render, RenderPosition} from './utils/dom.js';

import {generateFilm} from './mock/film.js';
import {generateFilter} from './mock/filter.js';

const FILM_LIST_COUNT = 20;
const FILM_LIST_COUNT_STEP = 5;

const siteHeaderElement = document.querySelector(`.header`);
const siteMainElement = document.querySelector(`.main`);
const footerStatistic = document.querySelector(`.footer__statistics`);

const films = new Array(FILM_LIST_COUNT).fill().map(generateFilm);
const filters = generateFilter(films);


const renderFilm = (filmListElement, film) => {
  const filmComponent = new FilmCardView(film);
  const filmDetails = new FilmDetailsView(film);

  const filmPoster = filmComponent.getElement().querySelector(`.film-card__poster`);
  const filmTitle = filmComponent.getElement().querySelector(`.film-card__title`);
  const filmComments = filmComponent.getElement().querySelector(`.film-card__comments`);

  const onEscKeyDown = (evt) => {
    if (isEscape(evt)) {
      onCloseModal(evt);
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  const onShowModal = (evt) => {
    evt.preventDefault();
    const closeButton = filmDetails.getElement().querySelector(`.film-details__close-btn`);
    closeButton.addEventListener(`click`, onCloseModal);

    document.body.classList.add(`hide-overflow`);

    render(document.body, filmDetails.getElement());
    document.addEventListener(`keydown`, onEscKeyDown);
  };

  const onCloseModal = (evt) => {
    evt.preventDefault();
    filmDetails.getElement().remove(filmDetails.getElement());
    filmDetails.removeElement();
    document.body.classList.remove(`hide-overflow`);
    document.removeEventListener(`keydown`, onEscKeyDown);
  };

  filmPoster.addEventListener(`click`, onShowModal);
  filmTitle.addEventListener(`click`, onShowModal);
  filmComments.addEventListener(`click`, onShowModal);

  render(filmListElement, filmComponent.getElement());
};

const renderList = (filmsContainer, filmList) => {
  const filmsComponent = new FilmsView();
  const filmsListComponent = new FilmListView();
  render(filmsContainer, filmsComponent.getElement());

  if (filmList.length === 0) {
    render(filmsComponent.getElement(), new EmptyList().getElement());
  } else {
    render(siteMainElement, new SortView().getElement(), RenderPosition.AFTERBEGIN);
    render(filmsComponent.getElement(), filmsListComponent.getElement());
    const filmsListElementContainer = filmsListComponent.getElement().querySelector(`.films-list__container`);

    for (let i = 1; i <= FILM_LIST_COUNT_STEP; i++) {
      renderFilm(filmsListElementContainer, filmList[i]);
    }

    if (films.length > FILM_LIST_COUNT_STEP) {
      let renderTemplateFilmsCount = FILM_LIST_COUNT_STEP;
      const showMoreButton = new ShowMoreButtonView();
      render(filmsListComponent.getElement(), showMoreButton.getElement());

      showMoreButton.getElement().addEventListener(`click`, () => {
        films.slice(renderTemplateFilmsCount, renderTemplateFilmsCount + FILM_LIST_COUNT_STEP)
          .forEach((film) => renderFilm(filmsListElementContainer, film));
        renderTemplateFilmsCount += FILM_LIST_COUNT_STEP;

        if (renderTemplateFilmsCount >= films.length) {
          showMoreButton.getElement().remove();
          showMoreButton.removeElement();
        }
      });
    }
  }
};

render(siteHeaderElement, new UserTitleView().getElement());
renderList(siteMainElement, films);
render(siteMainElement, new NavigationView(filters).getElement(), RenderPosition.AFTERBEGIN);

footerStatistic.textContent = `${films.length} movies inside`;
