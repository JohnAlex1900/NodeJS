const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./helper.test");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Helper function to get a token for the user
const getTokenForUser = async (user) => {
  const response = await api.post("/api/login").send({
    username: user.username,
    password: "password", // Assuming a common test password
  });
  return response.body.token;
};

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password", 10);
  const user = new User({ username: "testuser", passwordHash });

  await user.save();

  let blogObject = new Blog({ ...helper.initialBlogs[0], user: user._id });
  await blogObject.save();

  blogObject = new Blog({ ...helper.initialBlogs[1], user: user._id });
  await blogObject.save();
});

describe("Blog API tests", () => {
  let token;

  beforeEach(async () => {
    const user = { username: "testuser", password: "password" };
    token = await getTokenForUser(user);
  });

  describe("GET /api/blogs", () => {
    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
      const response = await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${token}`);
      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test("a specific blog is within the returned blogs", async () => {
      const response = await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${token}`);
      const titles = response.body.map((r) => r.title);
      expect(titles).toContain("React Frontend");
    });
  });

  describe("POST /api/blogs", () => {
    test("a valid blog can be added", async () => {
      const newBlog = {
        title: "Backend Testing",
        author: "Arthur Jacobs",
        url: "https://books.com/backend-testing",
        likes: 120,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
      const titles = blogsAtEnd.map((n) => n.title);
      expect(titles).toContain("Backend Testing");
    });

    test("blog without title is not added", async () => {
      const newBlog = {
        author: "Arthur Jacobs",
        url: "https://books.com/backend-testing",
        likes: 120,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test("if the likes property is missing from the request, it defaults to 0", async () => {
      const newBlog = {
        title: "No Likes Property",
        author: "Unknown",
        url: "https://books.com/no-likes-property",
      };

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      expect(response.body.likes).toBe(0);
    });
  });

  describe("DELETE /api/blogs/:id", () => {
    test("a blog can be deleted", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

      const titles = blogsAtEnd.map((r) => r.title);
      expect(titles).not.toContain(blogToDelete.title);
    });
  });

  describe("Unique identifier tests", () => {
    test("unique identifier property of the blog posts is named id", async () => {
      const response = await api
        .get("/api/blogs")
        .set("Authorization", `Bearer ${token}`);
      response.body.forEach((blog) => {
        expect(blog.id).toBeDefined();
        expect(blog._id).toBeUndefined();
      });
    });
  });
});

describe("PUT /api/blogs/:id", () => {
  let token;

  beforeEach(async () => {
    const user = { username: "testuser", password: "password" };
    token = await getTokenForUser(user);
  });

  test("updates the number of likes of a blog post", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlogData = {
      likes: blogToUpdate.likes + 1,
    };

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedBlogData)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultBlog.body.likes).toBe(updatedBlogData.likes);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);
    expect(updatedBlog.likes).toBe(updatedBlogData.likes);
  });

  test("fails with status code 400 if data invalid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const invalidData = {
      likes: "invalid likes",
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(invalidData)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    const notUpdatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);
    expect(notUpdatedBlog.likes).toBe(blogToUpdate.likes);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
