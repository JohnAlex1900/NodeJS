const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { userExtractor } = require("../utils/middleware");

// Get all blogs
blogsRouter.get("/", async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
    });
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Get a specific blog by ID
blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).json({ error: "Blog not found" });
  }
});

// Post a new blog
blogsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;
    if (!request.user) {
      return response.status(401).json({ error: "token missing or invalid" });
    }
    const user = request.user;

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0, // Default to 0 if not provided
      user: user.id,
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

// Delete a specific blog by ID
blogsRouter.delete("/:id", async (request, response) => {
  const blogId = request.params.id;
  const user = request.user;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return response.status(404).json({ error: "Blog not found" });
  }

  // Check if the user making the request is the same as the creator of the blog
  if (blog.user.toString() !== user._id.toString()) {
    return response
      .status(403)
      .json({ error: "Unauthorized to delete this blog" });
  }

  // Delete the blog
  await Blog.findByIdAndDelete(blogId);
  response.status(204).end();
});

blogsRouter.put("/:id", userExtractor, async (request, response, next) => {
  const body = request.body;
  const user = request.user;

  const blog = {
    likes: body.likes,
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedBlog) {
      return response.status(404).end();
    }

    response.json(updatedBlog.toJSON());
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
