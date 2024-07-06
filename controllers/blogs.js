const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const { userExtractor } = require("../utils/middleware");
const jwt = require("jsonwebtoken");

// Get all blogs
blogsRouter.get("/", async (request, response) => {
  try {
    const blogs = await Blog.find({})
      .populate("user", {
        username: 1,
        name: 1,
      })
      .populate("comments");
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Get a specific blog by ID
blogsRouter.get("/:id", async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id).populate("user", {
      username: 1,
      name: 1,
    });
    if (blog) {
      response.json(blog);
    } else {
      response.status(404).json({ error: "Blog not found" });
    }
  } catch (error) {
    response.status(400).json({ error: "Invalid blog ID" });
  }
});

// Post a new blog
blogsRouter.post("/", userExtractor, async (request, response, next) => {
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
      likes: body.likes || 0,
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
blogsRouter.delete("/:id", userExtractor, async (request, response) => {
  const blogId = request.params.id;
  const user = request.user;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return response.status(404).json({ error: "Blog not found" });
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response
      .status(403)
      .json({ error: "Unauthorized to delete this blog" });
  }

  await Blog.findByIdAndDelete(blogId);
  response.status(204).end();
});

blogsRouter.put("/:id", userExtractor, async (request, response, next) => {
  const { likes } = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      { new: true, runValidators: true, context: "query" }
    ).populate("user", { username: 1, name: 1 });

    if (!updatedBlog) {
      return response.status(404).end();
    }

    response.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

// Comments Section
blogsRouter.post("/:id/comments", userExtractor, async (request, response) => {
  try {
    const { id } = request.params;
    const { comment } = request.body;

    if (!comment) {
      return response.status(400).json({ error: "Comment content missing" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }

    blog.comments = blog.comments.concat(comment);
    const updatedBlog = await blog.save();

    response.json(updatedBlog);
  } catch (error) {
    response.status(400).json({ error: "Invalid blog ID" });
  }
});

module.exports = blogsRouter;
