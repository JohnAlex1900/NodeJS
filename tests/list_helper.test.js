const listHelper = require("../utils/list_helper");

describe("dummy", () => {
  test("dummy returns one", () => {
    const blogs = [];
    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
  });
});

describe("total likes", () => {
  const blogs = [
    {
      _id: "1",
      title: "Blog 1",
      author: "Author 1",
      url: "http://blog1.com",
      likes: 10,
    },
    {
      _id: "2",
      title: "Blog 2",
      author: "Author 2",
      url: "http://blog2.com",
      likes: 5,
    },
    {
      _id: "3",
      title: "Blog 3",
      author: "Author 3",
      url: "http://blog3.com",
      likes: 0,
    },
  ];

  test("total likes of empty list is zero", () => {
    const result = listHelper.totalLikes([]);
    expect(result).toBe(0);
  });

  test("total likes of list with one blog equals the likes of that blog", () => {
    const result = listHelper.totalLikes([blogs[0]]);
    expect(result).toBe(10);
  });

  test("total likes of a bigger list is calculated right", () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(15);
  });
});

describe("favorite blog", () => {
  const blogs = [
    {
      _id: "1",
      title: "Blog 1",
      author: "Author 1",
      url: "http://blog1.com",
      likes: 10,
    },
    {
      _id: "2",
      title: "Blog 2",
      author: "Author 2",
      url: "http://blog2.com",
      likes: 5,
    },
    {
      _id: "3",
      title: "Blog 3",
      author: "Author 3",
      url: "http://blog3.com",
      likes: 12,
    },
  ];

  test("favorite blog when list is empty", () => {
    const result = listHelper.favoriteBlog([]);
    expect(result).toBe(null);
  });

  test("favorite blog when list has one blog", () => {
    const result = listHelper.favoriteBlog([blogs[0]]);
    expect(result).toEqual(blogs[0]);
  });

  test("favorite blog when list has multiple blogs", () => {
    const result = listHelper.favoriteBlog(blogs);
    expect(result).toEqual(blogs[2]);
  });
});

describe("most blogs", () => {
  const blogs = [
    {
      _id: "1",
      title: "Blog 1",
      author: "Author 1",
      url: "http://blog1.com",
      likes: 10,
    },
    {
      _id: "2",
      title: "Blog 2",
      author: "Author 1",
      url: "http://blog2.com",
      likes: 5,
    },
    {
      _id: "3",
      title: "Blog 3",
      author: "Author 2",
      url: "http://blog3.com",
      likes: 12,
    },
  ];

  test("most blogs when list is empty", () => {
    const result = listHelper.mostBlogs([]);
    expect(result).toBe(null);
  });

  test("most blogs when list has multiple blogs", () => {
    const result = listHelper.mostBlogs(blogs);
    expect(result).toEqual({ author: "Author 1", blogs: 2 });
  });
});
