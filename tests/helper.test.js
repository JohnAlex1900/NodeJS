const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "React Backend",
    author: "aurthur Jacobs",
    url: "https://books.com/react-backend",
    likes: 20,
  },
  {
    title: "React Frontend",
    author: "john alex",
    url: "https://books.com/react-frontend",
    likes: 62,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "Backend Testing",
    url: "https://books.com/backend-testing",
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
