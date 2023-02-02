/**
 * @jest-environment jsdom
*/

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import store from "../__mocks__/store.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
    );
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const windowIcon = await waitFor(() => screen.getByTestId("icon-window"));
      //to-do write expect expression
      const iconIsActive = windowIcon.classList.contains("active-icon");
      expect(iconIsActive).toBeTruthy();
    });
    describe("When I am on Bills Page and there's no bills", () => {
      test("Then the table should be empty", () => {
        document.body.innerHTML = BillsUI({ data: [] });
        const wrapperTables = screen.getByTestId("tbody");
        expect(wrapperTables.children.length).toBe(0);
      });
    });
    describe("When I am on Bills Page and there's bills", () => {
      test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const dates = screen
        .getAllByTestId(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.textContent);
          const antiChrono = (a, b) => (a < b ? 1 : -1);
          const datesSorted = [...dates].sort(antiChrono);
          expect(dates).toEqual(datesSorted);
        });
        test("Then modal should append and display the right bill document when user click on eye icon", async () => {
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
            );
            document.body.innerHTML = BillsUI({ data: bills });
            const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname });
            };
            const currentBills = new Bills({
              document,
              onNavigate,
              store: store,
              localStorage: window.localStorage,
            });
            $.fn.modal = jest.fn();
            const modalSpy = jest.spyOn($.fn, "modal");
            const eyeIcons = screen.getAllByTestId("icon-eye");
            eyeIcons.map((icon) => userEvent.click(icon));
            expect(modalSpy).toHaveBeenCalledTimes(4);
          });
          test("Then click on new bill button should display newbill form page", () => {
            // Simule connexion en tant qu'employé
            window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
            // Simule le contenu du DOM
            document.body.innerHTML = BillsUI({ data: bills });
            // Affiche le contenu relatif à la route spécifiée
            const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname });
            };
            // Simule un nouvel objet Bills
            const currentBills = new Bills({
              document,
              onNavigate,
              store: store,
              localStorage: window.localStorage,
            });
            // Fonction simulée avec implémentation du clique sur le bouton
            const handleClickNewBillTest = jest.fn((e) =>
            currentBills.handleClickNewBill(e)
            );
            const btnNewBill = screen.getByTestId("btn-new-bill");
            btnNewBill.addEventListener("click", handleClickNewBillTest);
            userEvent.click(btnNewBill);
            const newBillForm = screen.getByTestId("form-new-bill");
            expect(handleClickNewBillTest).toHaveBeenCalled();
            expect(newBillForm).toBeTruthy();
          });
        });
      });

      // ERRORS FROM BACKEND AND LOADING
      describe("Given I am connected as an employee", () => {
        describe("When I am on Bills page but back-end send an error message", () => {
          test("Then Error page should be rendered", () => {
            document.body.innerHTML = BillsUI({ error: "error message" });
            const errorMessage = screen.getByText("Erreur").textContent;
            expect(errorMessage).toBe(" Erreur ");
            document.body.innerHTML = "";
          });
        });
        describe("When i want to go to Bills page but it's loading", () => {
          test('Then loading page sould be rendered', () => {
            document.body.innerHTML = BillsUI({ loading: true });
            const loadingMessage = screen.getByText("Loading...");
            expect(loadingMessage.getAttribute('id')).toBe('loading');
          })
        })
      })


      // // TEST GET AVEC MOCK ET API
      describe("Given i am a user connected as Employee", () => {
        describe("When i navigate to Bills", () => {
          test("fetches bills from mock API GET", async () => {
            const spy = jest.spyOn(store.bills(), "list"); //Surveille la méthode list() dans l'objet bills
            const bills = await store.bills().list();
            expect(bills[0].date).toBeDefined();
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
      