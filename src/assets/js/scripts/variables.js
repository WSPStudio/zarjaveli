//
//
//
//
// Переменные
export const body = document.querySelector("body");
export const html = document.querySelector("html");
export const modals = document.querySelectorAll(".modal");

export const headerTop = document.querySelector(".header") ? document.querySelector(".header") : document.querySelector("head");
export const headerTopFixed = "header_fixed";
export let fixedHeader = true;
export let fixedElements = document.querySelectorAll("[data-fixed]");
export let stickyObservers = new Map();

export const allForms = document.querySelectorAll("form");

export const menuClass = ".header__mobile";
export const menu = document.querySelector(menuClass) ? document.querySelector(menuClass) : document.querySelector("head");
export const menuLink = document.querySelector(".menu-link") ? document.querySelector(".menu-link") : document.querySelector("head");
export const menuActive = "active";

export const burgerMedia = 1199;
export const bodyOpenModalClass = "modal-show";

export let windowWidth = window.innerWidth;
export let containerWidth = document.querySelector(".container").offsetWidth || 0;

export const checkWindowWidth = () => {
  windowWidth = window.innerWidth;
  containerWidth = document.querySelector(".container").offsetWidth || 0;
};
