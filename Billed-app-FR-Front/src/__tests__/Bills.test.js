/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import store from "../__mocks__/store.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      const iconIsActive = windowIcon.classList.contains("active-icon");
      expect(iconIsActive).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByTestId(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.textContent); 
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("Then modal should append and display the right bill document when user click on eye icon", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      $.fn.modal = jest.fn();
      const modalSpy = jest.spyOn($.fn, "modal");
      const eyeIcons = screen.getAllByTestId("icon-eye");
      eyeIcons.map((icon) => userEvent.click(icon));
      expect(modalSpy).toHaveBeenCalledTimes(4);
    });
    test("Then click on new bill button should display newbill form page", () => {

    })
  });
});

// // TEST GET AVEC MOCK ET API
describe("Giver i am a user connected as Employee", () => {
  describe("When i navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      const spy = jest.spyOn(store.bills(), "list"); //Surveille la méthode list() dans l'objet bills
      const bills = await store.bills().list();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(bills.length).toEqual(4);
    });
  });
  describe("fetches bills from API deliver an error", () => {
    test("error should be 404 message error", async () => {
      store.bills = jest.fn().mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("error should be 500 message error", async () => {
      store.bills = jest.fn().mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
