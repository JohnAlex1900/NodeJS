const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./helper.test");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();
});

describe("Blog API tests", () => {
  describe("GET /api/blogs", () => {
    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs");

      assert.strictEqual(response.body.length, helper.initialBlogs.length);
    });

    test("a specific blog is within the returned blogs", async () => {
      const response = await api.get("/api/blogs");

      const titles = response.body.map((r) => r.title);

      assert(titles.includes("React Frontend"));
    });
  });

  describe("POST /api/blogs", () => {
    test("a valid blog can be added", async () => {
      const newBlog = {
        title: "Backend Testing",
        author: "aurthur Jacobs",
        url: "https://books.com/backend-testing",
        likes: 120,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
      const titles = blogsAtEnd.map((n) => n.title);
      assert(titles.includes("Backend Testing"));
    });

    test("blog without title is not added", async () => {
      const newBlog = {
        author: "aurthur Jacobs",
        url: "https://books.com/backend-testing",
        likes: 120,
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("if the likes property is missing from the request, it defaults to 0", async () => {
      const newBlog = {
        title: "No Likes Property",
        author: "Unknown",
        url: "https://books.com/no-likes-property",
      };

      const response = await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      assert.strictEqual(response.body.likes, 0);
    });
  });

  describe("DELETE /api/blogs/:id", () => {
    test("a blog can be deleted", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
      const blogsAtEnd = await helper.blogsInDb();

      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes(blogToDelete.title));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });
  });

  describe("Unique identifier tests", () => {
    test("unique identifier property of the blog posts is named id", async () => {
      const response = await api.get("/api/blogs");
      response.body.forEach((blog) => {
        assert(blog.id !== undefined);
        assert(blog._id === undefined);
      });
    });
  });
});

describe("PUT /api/blogs/:id", () => {
  test("updates the number of likes of a blog post", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlogData = {
      likes: blogToUpdate.likes + 1,
    };

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlogData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(resultBlog.body.likes, updatedBlogData.likes);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);
    assert.strictEqual(updatedBlog.likes, updatedBlogData.likes);
  });
});

after(async () => {
  await mongoose.connection.close();
});
