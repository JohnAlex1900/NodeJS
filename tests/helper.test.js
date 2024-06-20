const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");

describe("Helper", () => {
  test("dummy returns one", () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    assert.strictEqual(result, 1);
  });
});

describe("total likes", () => {
  test("of empty list is zero", () => {
    const blogs = [];

    const result = listHelper.totalLikes(blogs);
    assert.strictEqual(result, 0);
  });

  const listWithOneBlog = [
    {
      title: "React Backend",
      author: "Arthur Jacobs",
      url: "https://books.com/react-backend",
      likes: 20,
    },
  ];

  test("when list has only one blog equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    assert.strictEqual(result, listWithOneBlog[0].likes);
  });

  const listWithMultipleBlogs = [
    {
      title: "React Backend",
      author: "Arthur Jacobs",
      url: "https://books.com/react-backend",
      likes: 20,
    },
    {
      title: "React Frontend",
      author: "Mary Spears",
      url: "https://books.com/react-frontend",
      likes: 41,
    },
  ];

  test("of a bigger list is calculated right", () => {
    const sum = listWithMultipleBlogs.reduce(
      (sum, blog) => sum + blog.likes,
      0
    );

    const result = listHelper.totalLikes(listWithMultipleBlogs);
    assert.strictEqual(result, sum);
  });
});

describe("favorite blog", () => {
  test("of empty list is null", () => {
    const blogs = [];

    const result = listHelper.favoriteBlog(blogs);
    assert.strictEqual(result, null);
  });

  const listWithOneBlog = [
    {
      title: "React Backend",
      author: "Arthur Jacobs",
      url: "https://books.com/react-backend",
      likes: 20,
    },
  ];

  test("when list has only one blog equals that blog", () => {
    const result = listHelper.favoriteBlog(listWithOneBlog);
    assert.deepStrictEqual(result, listWithOneBlog[0]);
  });

  const listWithMultipleBlogs = [
    {
      title: "React Backend",
      author: "Arthur Jacobs",
      url: "https://books.com/react-backend",
      likes: 20,
    },
    {
      title: "React Frontend",
      author: "Mary Spears",
      url: "https://books.com/react-frontend",
      likes: 41,
    },
    {
      title: "Node.js Basics",
      author: "John Doe",
      url: "https://books.com/node-basics",
      likes: 35,
    },
  ];

  test("of a bigger list is determined correctly", () => {
    const result = listHelper.favoriteBlog(listWithMultipleBlogs);
    assert.deepStrictEqual(result, listWithMultipleBlogs[1]);
  });
});

describe("most blogs", () => {
  test("of empty list is null", () => {
    const blogs = [];

    const result = listHelper.mostBlogs(blogs);
    assert.strictEqual(result, null);
  });

  const listWithOneBlog = [
    {
      title: "React Backend",
      author: "Arthur Jacobs",
      url: "https://books.com/react-backend",
      likes: 20,
    },
  ];

  test("when list has only one blog equals that author", () => {
    const result = listHelper.mostBlogs(listWithOneBlog);
    assert.deepStrictEqual(result, { author: "Arthur Jacobs", blogs: 1 });
  });

  const listWithMultipleBlogs = [
    {
      title: "React Backend",
      author: "Arthur Jacobs",
      url: "https://books.com/react-backend",
      likes: 20,
    },
    {
      title: "React Frontend",
      author: "Mary Spears",
      url: "https://books.com/react-frontend",
      likes: 41,
    },
    {
      title: "Node.js Basics",
      author: "John Doe",
      url: "https://books.com/node-basics",
      likes: 35,
    },
    {
      title: "Advanced Node.js",
      author: "John Doe",
      url: "https://books.com/advanced-node",
      likes: 25,
    },
    {
      title: "React Advanced",
      author: "Mary Spears",
      url: "https://books.com/react-advanced",
      likes: 45,
    },
  ];

  test("of a bigger list is determined correctly", () => {
    const result = listHelper.mostBlogs(listWithMultipleBlogs);
    assert.deepStrictEqual(result, { author: "Mary Spears", blogs: 2 });
  });
});
