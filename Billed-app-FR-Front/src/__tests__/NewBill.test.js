/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";

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
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
  describe("When I am on NewBill Page", () => {
    test("Then newbill icon in vertical layout should be highlighted", async () => {
      const mailIcon = await waitFor(() => screen.getByTestId("icon-mail"));
      //to-do write expect expression
      const iconIsActive = mailIcon.classList.contains("active-icon");
      expect(iconIsActive).toBeTruthy();
    });
    test("Then newBill form should be display", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then all form elements should be display", () => {
      document.body.innerHTML = NewBillUI();
      const form = screen.getByTestId("form-new-bill");
      expect(form.length).toEqual(9);
    });
    describe("When I want to add proof file", () => {
      test("Then the file event handler should run", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: store,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        const fileToAdd = screen.getByTestId("file");
        fileToAdd.addEventListener("change", handleChangeFile);
        userEvent.upload(fileToAdd, {
          file: new File(["hello"], "hello.png", { type: "image/png" }),
        });
        const numberOfFiles = screen.getByTestId("file").files.length;
        expect(numberOfFiles).toEqual(1);
      });
    });
  });
  // TEST POST
  describe("when user send new bill", () => {
    test("Then new bill sould be post to mock", async () => {
      const result = await waitFor(() => store.bills().create());
      expect(result).toStrictEqual({
        fileUrl: "https://localhost:3456/images/test.jpg",
        key: "1234",
      });
    });
    test("Then click on send form button should run handleSubmit event", async () => {
      const formNewBill = await waitFor(() =>
        screen.getByTestId("form-new-bill")
      );
      const handleSubmitNewBill = jest.fn();
      formNewBill.handleSubmit = handleSubmitNewBill;
      const submit = document.getElementById("btn-send-bill");
      submit.addEventListener("click", handleSubmitNewBill);
      userEvent.click(submit)
      expect(handleSubmitNewBill).toHaveBeenCalled();
    });
  });
});
