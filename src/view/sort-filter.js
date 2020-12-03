import AbstractView from "./abstract.js";

const createSortFilterTemplate = () => {
  return (`
    <ul class="sort">
      <li><a href="#" class="sort__button sort__button--active">Sort by default</a></li>
      <li><a href="#" class="sort__button">Sort by date</a></li>
      <li><a href="#" class="sort__button">Sort by rating</a></li>
    </ul>
  `).trim();
};

export default class Sort extends AbstractView {
  getTemplate() {
    return createSortFilterTemplate();
  }
}
