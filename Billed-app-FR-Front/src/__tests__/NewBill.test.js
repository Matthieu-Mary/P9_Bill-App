/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
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
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      document.body.innerHTML = NewBillUI();
    });
    test("Then newBill form should be display", () => {
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then all form elements should be display", () => {
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
      const result = await store.bills().create();
      console.log(result)
      expect(result).toStrictEqual({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'});
    });
  });
});
