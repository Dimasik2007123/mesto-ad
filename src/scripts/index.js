/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
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

const logoElement = document.querySelector(".header__logo");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
let cardToDelete = null;

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsInfoTitle =
  usersStatsModalWindow.querySelector(".popup__title");
const usersStatsInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsInfoUserTitle =
  usersStatsModalWindow.querySelector(".popup__text");
const usersStatsInfoUserList =
  usersStatsModalWindow.querySelector(".popup__list");

const createInfoString = (label, value) => {
  const template = document.querySelector("#popup-info-definition-template");
  const element = template.content.cloneNode(true);

  element.querySelector(".popup__info-term").textContent = label;
  element.querySelector(".popup__info-description").textContent = value;

  return element;
};

const createUserElement = (name) => {
  const template = document.querySelector("#popup-info-user-preview-template");
  const element = template.content.cloneNode(true);

  element.querySelector(".popup__list-item_type_badge").textContent = name;

  return element;
};

const handleDeleteCardClick = (cardElement, cardId) => {
  cardToDelete = { element: cardElement, id: cardId };
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();

  const form = evt.target;
  const submitButton = form.querySelector(".popup__button");

  const initialText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Удаление...";

  removeCard(cardToDelete.id)
    .then(() => {
      deleteCard(cardToDelete.element);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = initialText;
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsInfoList.innerHTML = "";
      usersStatsInfoUserList.innerHTML = "";

      usersStatsInfoTitle.textContent = "Статистика пользователей";
      usersStatsInfoUserTitle.textContent = "Все пользователи";

      const users = new Map();

      cards.forEach((card) => {
        const userName = card.owner.name;
        const currentCount = users.get(userName) || 0;
        users.set(userName, currentCount + 1);
      });

      usersStatsInfoList.append(
        createInfoString("Всего карточек:", cards.length),
      );

      usersStatsInfoList.append(
        createInfoString(
          "Первая создана:",
          formatDate(new Date(cards[cards.length - 1].createdAt)),
        ),
      );
      usersStatsInfoList.append(
        createInfoString(
          "Последняя создана:",
          formatDate(new Date(cards[0].createdAt)),
        ),
      );

      usersStatsInfoList.append(
        createInfoString("Всего пользователей:", users.size),
      );

      usersStatsInfoList.append(
        createInfoString(
          "Максимум карточек от одного:",
          Math.max(...users.values()),
        ),
      );

      Array.from(users.keys()).forEach((name) => {
        const element = createUserElement(name);
        usersStatsInfoUserList.append(element);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeClick = (cardData, likeButton, cardLikeCounter) => {
  const isLiked = likeCard(likeButton);
  changeLikeCardStatus(cardData._id, !isLiked)
    .then((updatedCardData) => {
      cardLikeCounter.textContent = updatedCardData.likes.length;
    })
    .catch((err) => {
      console.log(err);
      likeCard(likeButton);
    });
};

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
            handleLikeClick(cardData, likeButton, cardLikeCounter);
          },
          onDeleteCard: (cardElement, cardId) => {
            handleDeleteCardClick(cardElement, cardId);
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

logoElement.addEventListener("click", handleLogoClick);
setCloseModalWindowEventListeners(usersStatsModalWindow);

removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

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
            handleLikeClick(cardData, likeButton, cardLikeCounter);
          },
          onDeleteCard: (cardElement, cardId) => {
            handleDeleteCardClick(cardElement, cardId);
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
