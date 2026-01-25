export const likeCard = (likeButton) => {
  return likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const plusLikeCount = (cardLikeCounter) => {
  cardLikeCounter.textContent = +cardLikeCounter.textContent + 1;
};

export const minusLikeCount = (cardLikeCounter) => {
  cardLikeCounter.textContent = cardLikeCounter.textContent - 1;
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, ownerID },
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete",
  );
  const cardImage = cardElement.querySelector(".card__image");
  const cardLikeCounter = cardElement.querySelector(".card__like-count");

  cardElement.id = data._id;
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  cardLikeCounter.textContent = data.likes.length;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon({ likeButton, cardLikeCounter }),
    );
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link }),
    );
  }

  let isLiked = false;
  for (let i = 0; i < data.likes.length; i++) {
    if (data.likes[i]._id === ownerID) {
      isLiked = true;
      break;
    }
  }

  if (isLiked) likeCard(likeButton);

  if (data.owner._id !== ownerID) deleteButton.remove();

  return cardElement;
};
