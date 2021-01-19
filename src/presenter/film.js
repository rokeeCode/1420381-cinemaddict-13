import FilmCardView from "../view/film-card.js";
import FilmDetailsView from "../view/popup.js";

import {render, replace, remove, RenderPosition} from "../utils/dom-utils.js";
import {UserAction, UpdateType} from "../const.js";
import CommentsModel from "../model/comments";

const Mode = {
  CLOSED: `CLOSED`,
  OPENED: `OPENED`,
};

export default class Film {
  constructor(filmListContainer, changeData, changeMode, api) {
    this._filmListContainer = filmListContainer;
    this._changeData = changeData;

    this._scrollPosition = null;
    this._api = api;

    this._filmComponent = null;
    this._popup = null;

    this._mode = Mode.CLOSED;

    this._handleOpenClick = this._handleOpenClick.bind(this);
    this._handleClose = this._handleClose.bind(this);

    this._handleWatchListClick = this._handleWatchListClick.bind(this);
    this._handleAsWatchedListClick = this._handleAsWatchedListClick.bind(this);
    this._handleFavoriteListClick = this._handleFavoriteListClick.bind(this);
    this._handleAddComment = this._handleAddComment.bind(this);
    this._handleDeleteComment = this._handleDeleteComment.bind(this);
    this._handleModelEvents = this._handleModelEvents.bind(this);

    this._handlePopupFavoriteClick = this._handlePopupFavoriteClick.bind(this);
    this._handlePopupAlreadyWatchedClick = this._handlePopupAlreadyWatchedClick.bind(this);
    this._handlePopupWatchListClick = this._handlePopupWatchListClick.bind(this);

    this._commentsModel = new CommentsModel();
    this._commentsModel.addObserver(this._handleModelEvents);
  }

  init(film) {
    this.film = film;
    const prevFilmComponent = this._filmComponent;

    this._filmComponent = new FilmCardView(film);
    this._filmComponent.setFilmPosterClickHandler(this._handleOpenClick);
    this._filmComponent.setFilmTitleClickHandler(this._handleOpenClick);
    this._filmComponent.setFilmCommentsClickHandler(this._handleOpenClick);

    this._filmComponent.setFilmWatchListClickHandler(this._handleWatchListClick);
    this._filmComponent.setFilmAsWatchedClickHandler(this._handleAsWatchedListClick);
    this._filmComponent.setFilmFavoriteClickHandler(this._handleFavoriteListClick);

    if (prevFilmComponent === null) {
      render(this._filmListContainer, this._filmComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this._mode === Mode.OPENED) {
      this._onShowModal();
      replace(this._filmComponent, prevFilmComponent);
    }

    remove(prevFilmComponent);
  }

  destroy() {
    remove(this._filmComponent);
    remove(this._popup);
  }

  resetView() {
    if (this._mode !== Mode.CLOSED) {
      this._onCloseModal();
    }
  }

  _onCloseModal() {
    remove(this._popup);
    document.body.classList.remove(`hide-overflow`);

    this._mode = Mode.CLOSED;
  }

  _handleClose() {
    this._onCloseModal();
  }

  _onShowModal() {
    this._mode = Mode.OPENED;
    const prevFilmDetails = this._popup;
    const filmId = this.film.id;

    this._api.getComments(filmId)
      .then((comments) => {
        this._commentsModel.setComments(comments);
        this.film.comments = this._commentsModel.getComments();
        this._popup = new FilmDetailsView(this.film);
        this._setPopUpHandlers();

        document.body.classList.add(`hide-overflow`);

        if (prevFilmDetails !== null && document.body.contains(prevFilmDetails.getElement())) {
          replace(this._popup, prevFilmDetails);
          this._restoreScrollPosition();
        } else {
          render(document.body, this._popup, RenderPosition.BEFOREEND);
        }
      })
      .catch(() => {
        this._commentsModel.setComments([]);
      });
  }

  _restoreScrollPosition() {
    this._popup.getElement().scroll(0, this._scrollPosition);
  }

  _handleOpenClick() {
    this._onShowModal();
  }

  _setPopUpHandlers() {
    this._popup.setEscapePressHandler(this._handleClose);
    this._popup.setCloseCrossClickHandler(this._handleClose);
    this._popup.setDeleteComment(this._handleDeleteComment);
    this._popup.setSubmitCommentHandler(this._handleAddComment);

    this._popup.setFavoriteClickHandler(this._handlePopupFavoriteClick);
    this._popup.setAsWatchedClickHandler(this._handlePopupAlreadyWatchedClick);
    this._popup.setWatchListClickHandler(this._handlePopupWatchListClick);
  }

  _handlePopupWatchListClick(scrollPosition) {
    this._scrollPosition = scrollPosition;

    this._changeData(
        UserAction.UPDATE_FILM,
        UpdateType.MINOR,
        Object.assign(
            {},
            this.film,
            {
              isFilmInWatchList: !this.film.isFilmInWatchList,
              comments: this._commentsModel.getComments().map((item) => item)
            }
        )
    );

    this._restoreScrollPosition();
  }

  _handlePopupAlreadyWatchedClick(scrollPosition) {
    this._scrollPosition = scrollPosition;

    this._changeData(
        UserAction.UPDATE_FILM,
        UpdateType.MINOR,
        Object.assign(
            {},
            this.film,
            {
              isFilmInAlreadyWatch: !this.film.isFilmInAlreadyWatch,
              comments: this._commentsModel.getComments().map((item) => item)
            }
        )
    );

    this._restoreScrollPosition();
  }

  _handlePopupFavoriteClick(scrollPosition) {
    this._scrollPosition = scrollPosition;

    this._changeData(
        UserAction.UPDATE_FILM,
        UpdateType.MINOR,
        Object.assign(
            {},
            this.film,
            {
              isFilmInFavorite: !this.film.isFilmInFavorite,
              comments: this._commentsModel.getComments().map((item) => item)
            }
        )
    );

    this._restoreScrollPosition();
  }

  _handleWatchListClick() {
    this._changeData(
        UserAction.UPDATE_FILM,
        UpdateType.MAJOR,
        Object.assign(
            {},
            this.film,
            {
              isFilmInWatchList: !this.film.isFilmInWatchList,
              comments: this._commentsModel.getComments().map((item) => item)
            }
        )
    );
  }

  _handleAsWatchedListClick() {
    this._changeData(
        UserAction.UPDATE_FILM,
        UpdateType.MAJOR,
        Object.assign(
            {},
            this.film,
            {
              isFilmInAlreadyWatch: !this.film.isFilmInAlreadyWatch,
              comments: this._commentsModel.getComments().map((item) => item)
            }
        )
    );
  }

  _handleFavoriteListClick() {
    this._changeData(
        UserAction.UPDATE_FILM,
        UpdateType.MAJOR,
        Object.assign(
            {},
            this.film,
            {
              isFilmInFavorite: !this.film.isFilmInFavorite,
              comments: this._commentsModel.getComments().map((item) => item)
            }
        )
    );
  }

  _handleAddComment(comment, scrollPosition) {
    const filmId = this.film.id;
    this._scrollPosition = scrollPosition;

    this._popup.updateData({
      isDisabled: true
    });

    this._api.addComment(comment, filmId)
      .then((comments) => {
        const lastComment = comments.comments[comments.comments.length - 1];
        this._commentsModel.addComment(UserAction.UPDATE_COMMENT, lastComment);
      })
      .catch(() => {
        this.setAborting();
      });

    this._restoreScrollPosition();
  }

  _handleDeleteComment(commentId, scrollPosition) {
    this._popup.updateData({
      isDisabled: true,
      deletedId: commentId
    });

    this._api.deleteComment(commentId)
      .then(() => {
        this._commentsModel.deleteComment(UserAction.UPDATE_COMMENT, commentId);
      })
      .catch(() => {
        this.setAborting();
      });

    this._scrollPosition = scrollPosition;
  }

  _handleModelEvents(userAction) {
    switch (userAction) {
      case UserAction.UPDATE_COMMENT:
        this._changeData(
            UserAction.UPDATE_FILM,
            UpdateType.MINOR,
            Object.assign(
                {},
                this.film,
                {
                  comments: this._commentsModel.getComments().map((item) => item)
                }
            )
        );
        break;
    }
  }

  setAborting() {
    const resetPopupState = () => {
      this._popup.updateData({
        isDisabled: false,
        isDeleting: false,
        deletedId: null
      });
    };

    this._popup.shake(resetPopupState);
  }
}
