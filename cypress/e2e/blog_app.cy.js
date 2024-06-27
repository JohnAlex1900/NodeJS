describe("Blog App", () => {
  beforeEach(function () {
    cy.request("POST", `${Cypress.env("BACKEND")}/testing/reset`);
    const user = {
      name: "Otheruser",
      username: "jamie",
      password: "jamieindigo",
    };
    cy.request("POST", `${Cypress.env("BACKEND")}/users/`, user);
    cy.visit("");
  });

  it("first page can be opened", function () {
    cy.contains("login");
  });

  it("login form can be opened", function () {
    cy.contains("login").click();
  });

  it("user can login", function () {
    cy.contains("login").click();
    cy.get("#username").type("jamie");
    cy.get("#password").type("jamieindigo");
    cy.get("#login-button").click();

    cy.contains("Otheruser logged-in");
  });

  describe("when logged in", function () {
    beforeEach(function () {
      cy.login({ username: "jamie", password: "jamieindigo" });
    });

    it("a new blog can be created", function () {
      cy.contains("new blog").click();
      cy.get("#title").type("a blog created by cypress");
      cy.get("#author").type("john irungu");
      cy.get("#url").type("https://books.com/cypress-testing");
      cy.contains("create").click();
      cy.contains("a blog created by cypress");
    });

    describe("and a blog exists", function () {
      beforeEach(function () {
        cy.createBlog({
          title: "another blog cypress",
          author: "John Alex",
          url: "https://books.com/more-cypress",
        });
      });

      it("users can like a blog", function () {
        cy.contains("another blog cypress")
          .parent()
          .find("button")
          .as("viewButton");
        cy.get("@viewButton").click();
        cy.get("@viewButton").parent().find(".likeButton").click();
        cy.get("@viewButton").parent().contains("likes: 1");
      });

      it("creator can delete a blog", function () {
        cy.contains("another blog cypress")
          .parent()
          .find("button")
          .as("viewButton");
        cy.get("@viewButton").click();
        cy.get("@viewButton").parent().find(".removeButton").click();
        cy.on("window:confirm", () => true);
        cy.contains("another blog cypress").should("not.exist");
      });

      it("only creator can see the delete button", function () {
        cy.contains("another blog cypress")
          .parent()
          .find("button")
          .as("viewButton");
        cy.get("@viewButton").click();
        cy.get("@viewButton")
          .parent()
          .find(".removeButton")
          .should("be.visible");

        const user = {
          name: "Not Creator",
          username: "notcreator",
          password: "notcreatorpassword",
        };
        cy.request("POST", `${Cypress.env("BACKEND")}/users/`, user).then(
          () => {
            cy.login({
              username: "notcreator",
              password: "notcreatorpassword",
            });

            cy.contains("another blog cypress")
              .parent()
              .find("button")
              .as("viewButton");
            cy.get("@viewButton").click();

            // Add a short wait to ensure the UI updates
            cy.wait(500);

            cy.get("@viewButton")
              .parent()
              .find(".removeButton")
              .should("not.exist");
          }
        );
      });

      it("blogs are ordered by likes", function () {
        cy.createBlog({
          title: "most liked blog",
          author: "Jane Doe",
          url: "https://books.com/most-liked",
          likes: 5,
        });

        cy.createBlog({
          title: "least liked blog",
          author: "John Smith",
          url: "https://books.com/least-liked",
          likes: 1,
        });

        cy.get(".blog").then((blogs) => {
          cy.wrap(blogs[0]).contains("most liked blog");
          cy.wrap(blogs[1]).contains("least liked blog");
          cy.wrap(blogs[2]).contains("another blog cypress");
        });
      });
    });
  });
});
