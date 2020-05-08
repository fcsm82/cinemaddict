import FilmDetails from "../components/films/film-details";
import FilmCard from "../components/films/film-card";
import {render, remove, replace} from "../util/dom-util";

const Mode = {
  DEFAULT: `default`,
  DETAILS: `details`,
};

export default class MovieController {
  constructor(container, onDataChange, onViewChange) {
    this._container = container;
    this._onDataChange = onDataChange;
    this._onViewChange = onViewChange;
    this._mode = Mode.DEFAULT;
    this._filmCardComponent = null;
    this._filmDetailsComponent = null;

    this._body = document.querySelector(`body`);

    this._onEscKeyDown = this._onEscKeyDown.bind(this);
  }

  render(film) {
    const oldFilmCardComponent = this._filmCardComponent;
    const oldFilmDetailsComponent = this._filmDetailsComponent;

    this._filmCardComponent = new FilmCard(film);
    this._filmDetailsComponent = new FilmDetails(film);

    this._filmCardComponent.setPosterClickListener(() => {
      this._openFilmDetails();
      document.addEventListener(`keydown`, this._onEscKeyDown);
    });

    this._filmCardComponent.setTitleClickListener(() => {
      this._openFilmDetails();
      document.addEventListener(`keydown`, this._onEscKeyDown);
    });

    this._filmCardComponent.setCommentsClickListener(() => {
      this._openFilmDetails();
      document.addEventListener(`keydown`, this._onEscKeyDown);
    });

    this._filmCardComponent.setAddToWatchlistClickListener(() => {
      this._onDataChange(this, film, Object.assign({}, film, {
        isInWatchlist: !film.isInWatchlist,
      }));
    });

    this._filmCardComponent.setAlreadyWatchedClickListener(() => {
      this._onDataChange(this, film, Object.assign({}, film, {
        isInHistory: !film.isInHistory,
      }));
    });

    this._filmCardComponent.setAddToFavouriteClickListener(() => {
      this._onDataChange(this, film, Object.assign({}, film, {
        isInFavorites: !film.isInFavorites,
      }));
    });

    this._filmDetailsComponent.setCloseButtonClickListener(() => this._closeFilmDetails());

    this._filmDetailsComponent.setAddToWatchlistClickListener(() => {
      this._onDataChange(this, film, Object.assign({}, film, {
        isInWatchlist: !film.isInWatchlist,
      }));
    });

    this._filmDetailsComponent.setAlreadyWatchedClickListener(() => {
      this._onDataChange(this, film, Object.assign({}, film, {
        isInHistory: !film.isInHistory,
      }));
    });

    this._filmDetailsComponent.setAddToFavouriteClickListener(() => {
      this._onDataChange(this, film, Object.assign({}, film, {
        isInFavorites: !film.isInFavorites,
      }));
    });

    this._filmDetailsComponent.setEmojiClickListener((evt) => {
      const currentEmoji = evt.target.value;
      const emojiContainer = this._filmDetailsComponent.getEmojiContainer();
      emojiContainer.innerHTML = `<img src="images/emoji/${currentEmoji}.png" width="55" height="55" alt="emoji-${currentEmoji}">`;
    });

    if (oldFilmDetailsComponent && oldFilmCardComponent) {
      replace(this._filmCardComponent, oldFilmCardComponent);
      replace(this._filmDetailsComponent, oldFilmDetailsComponent);
    } else {
      render(this._container, this._filmCardComponent);
    }
  }

  setDefaultView() {
    if (this._mode !== Mode.DEFAULT) {
      this._closeFilmDetails();
    }
  }

  _closeFilmDetails() {
    document.removeEventListener(`keydown`, this._onEscKeyDown);
    remove(this._filmDetailsComponent);
    this._mode = Mode.DEFAULT;
  }

  _openFilmDetails() {
    this._onViewChange();
    this._body.appendChild(this._filmDetailsComponent.getElement());
    this._mode = Mode.DETAILS;
    this._filmDetailsComponent.recoverListeners();
    document.addEventListener(`keydown`, this._onEscKeyDown);
  }

  _onEscKeyDown(evt) {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      this._closeFilmDetails();
    }
  }
}
