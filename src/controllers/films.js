import NoFilms from "../components/films/no-films";
import FilmDetails from "../components/films/film-details";
import FilmCard from "../components/films/film-card";
import FilmsListExtra from "../components/films/films-list-extra";
import {sortArrayOfObjectsByKey, getDateFromString} from "../util/util";
import {render, remove} from "../util/dom-util";
import {SortType} from "../components/sort";
import {QUANTITY_FILMS} from "../util/consts";
import ButtonShowMore from "../components/films/button-showmore";

const SECTION_NAMES = new Map([
  [`rating`, `Top Rated`],
  [`comments`, `Most commented`]
]);

export default class FilmsController {
  constructor(container, sortComponent) {
    this._container = container;

    this._sortComponent = sortComponent;

    this._noFilmsComponent = new NoFilms();
    this._buttonShowMore = new ButtonShowMore();

    this._body = document.querySelector(`body`);
    this._filmsList = container.getElement().querySelector(`.films-list`);
    this._filmsListContainer = container.getElement().querySelector(`.films-list__container`);

    this._shownFilmsCount = QUANTITY_FILMS.ON_START;

    // this._sortComponent.typeChangeHandler((sort) => this.render(this.films, sort));
  }

  _getTopFilms(films, key) {
    return films.sort(sortArrayOfObjectsByKey(key)).slice(0, 2);
  }

  _renderFilmExtraSections(container, films) {
    SECTION_NAMES.forEach((name, key) => {
      const filmsListExtraComponent = new FilmsListExtra(name);
      render(container, filmsListExtraComponent);

      const topFilms = this._getTopFilms(films, key);
      const filmsListContainer = filmsListExtraComponent.getElement().querySelector(`.films-list__container`);
      this._renderFilmCards(filmsListContainer, topFilms);
    });
  }

  _getSortedFilms(films, sortType, from, to) {
    let sortedFilms = [];
    const shownFilms = films.slice();

    switch (sortType) {
      case SortType.DATE:
        sortedFilms = shownFilms.sort((a, b) => getDateFromString(b.release) - getDateFromString(a.release));
        break;
      case SortType.RATING:
        sortedFilms = shownFilms.sort((a, b) => b.rating - a.rating);
        break;
      case SortType.DEFAULT:
        sortedFilms = shownFilms;
        break;
    }

    return sortedFilms.slice(from, to);
  }

  _renderFilmCards(container, films) {
    films.forEach((film) => {
      const filmDetailsComponent = new FilmDetails(film);
      const openPopup = () => {
        render(this._body, filmDetailsComponent);
        filmDetailsComponent.setCloseButtonClickHandler(onFilmDetailsClose);
      };

      const onEscKeyDown = (evt) => {
        const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

        if (isEscKey) {
          onFilmDetailsClose();
          document.removeEventListener(`keydown`, onEscKeyDown);
        }
      };

      const onFilmDetailsClose = () => {
        remove(filmDetailsComponent);
      };

      const onFilmCardElementClick = () => {
        openPopup();
        document.addEventListener(`keydown`, onEscKeyDown);
      };

      let filmCardComponent = new FilmCard(film);
      render(container, filmCardComponent);

      filmCardComponent.setPosterClickHandler(onFilmCardElementClick);
      filmCardComponent.setTitleClickHandler(onFilmCardElementClick);
      filmCardComponent.setCommentsClickHandler(onFilmCardElementClick);
    });
  }

  render(films) {
    const renderButtonShowMore = () => {
      if (this._shownFilmsCount >= films.length) {
        return;
      }

      render(this._filmsList, this._buttonShowMore);
    };

    const container = this._container.getElement();

    if (films.length === 0) {
      render(container, this._noFilmsComponent);
      return;
    }

    this._renderFilmCards(this._filmsListContainer, films.slice(0, this._shownFilmsCount));
    renderButtonShowMore();

    const onButtonShowMoreClick = () => {
      const prevFilmsCount = this._shownFilmsCount;
      this._shownFilmsCount = this._shownFilmsCount + QUANTITY_FILMS.BY_BUTTON;

      const sortedFilms = this._getSortedFilms(films, this._sortComponent.getSortType(), prevFilmsCount, this._shownFilmsCount);

      this._renderFilmCards(this._filmsListContainer, sortedFilms);

      if (this._shownFilmsCount >= films.length) {
        remove(this._buttonShowMore);
      }
    };

    this._buttonShowMore.setClickHandler(onButtonShowMoreClick);

    this._sortComponent.setSortTypeChangeHandler((sortType) => {

      // this._shownFilmsCount = QUANTITY_FILMS.BY_BUTTON;

      const sortedFilms = this._getSortedFilms(films, sortType, 0, this._shownFilmsCount);

      this._filmsListContainer.innerHTML = ``;

      this._renderFilmCards(this._filmsListContainer, sortedFilms);

      renderButtonShowMore();
    });

    this._renderFilmExtraSections(container, films);
  }
}
