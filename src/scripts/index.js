/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import {
  createCardElement,
  deleteCard,
  likeCard,
  plusLikeCount,
  minusLikeCount,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  getCardList,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  sendNewCard,
  removeCard,
  changeLikeCardStatus,
} from "./components/api.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description",
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const form = evt.target;
  const submitButton = form.querySelector(".popup__button");

  const initialText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = initialText;
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const form = evt.target;
  const submitButton = form.querySelector(".popup__button");

  const initialText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Сохранение...";

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = initialText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const form = evt.target;
  const submitButton = form.querySelector(".popup__button");

  const initialText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Создание...";

  sendNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: ({ likeButton, cardLikeCounter }) => {
            const isLiked = likeCard(likeButton);
            changeLikeCardStatus(cardData._id, !isLiked);
            if (isLiked) plusLikeCount(cardLikeCounter);
            else minusLikeCount(cardLikeCounter);
          },
          onDeleteCard: (cardElement) => {
            removeCard(cardElement.id);
            deleteCard(cardElement);
          },
          ownerID: cardData.owner._id,
        }),
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err); // В случае возникновения ошибки выводим её в консоль
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = initialText;
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// отображение карточек
/*initialCards.forEach((data) => {
  placesWrap.append(
    createCardElement(data, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
    })
  );
});*/

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: ({ likeButton, cardLikeCounter }) => {
            const isLiked = likeCard(likeButton);
            changeLikeCardStatus(cardData._id, !isLiked);
            if (isLiked) plusLikeCount(cardLikeCounter);
            else minusLikeCount(cardLikeCounter);
          },
          onDeleteCard: (cardElement) => {
            removeCard(cardElement.id);
            deleteCard(cardElement);
          },
          ownerID: userData._id,
        }),
      );
    });

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });
