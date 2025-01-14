import { PrismaClient } from "@prisma/client";
import { deleteFromCloudinary } from "../utils/Cloudinary.js";

const prisma = new PrismaClient();

class BlogController {
  async getBlogsPreviewByCurrentUserId(req, res) {
    try {
      const userId = req.userId;
      const userRole = req.role;

      const mapBlogPreviews = (blogPreviews) => {
        return blogPreviews.map((blog) => ({
          blogId: blog.blogId,
          title: blog.title,
          createdAt: blog.createdAt,
          body: blog.body.substring(0, 50),
          categories: blog.categories.map((entry) => entry.category.name),
          authors: blog.authors.map((author) => ({
            fname: author.user.fname,
            lname: author.user.lname,
            profilePictureUrl: author.user.profilePictureUrl,
          })),
        }));
      };

      if (userRole === "Administrador") {
        const blogPreviewsAll = await prisma.blog.findMany({
          include: {
            categories: {
              include: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            authors: {
              include: {
                user: {
                  select: {
                    fname: true,
                    lname: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        });

        if (blogPreviewsAll.length === 0) {
          return res.status(404).json({ message: "No blogs found." });
        }

        const previews = mapBlogPreviews(blogPreviewsAll);
        return res.status(200).json(previews);
      }

      const blogPreviews = await prisma.blog.findMany({
        where: {
          authors: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          authors: {
            include: {
              user: {
                select: {
                  fname: true,
                  lname: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      if (blogPreviews.length === 0) {
        return res
          .status(404)
          .json({ message: "No blogs found for this user." });
      }

      const previews = mapBlogPreviews(blogPreviews);
      res.status(200).json(previews);
    } catch (error) {
      console.error("Error fetching blog previews:", error.message);
      res.status(500).json({ error: "Failed to fetch blog previews." });
    }
  }
  async createBlog(req, res) {
    try {
      const currentUserIdAuthor = req.userId;
      const {
        title,
        body,
        categories,
        coverImageUrl,
        authors,
        published,
        coverImagePublicId,
      } = req.body;
      console.log(req.body);

      if (!authors.includes(currentUserIdAuthor)) {
        authors.push(currentUserIdAuthor);
      }

      const blog = await prisma.blog.create({
        data: {
          title,
          body,
          coverImageUrl,
          coverImagePublicId,
          published,
        },
      });

      const blogId = blog.blogId;

      await Promise.all(
        authors.map((userId) =>
          prisma.blogAuthor.create({
            data: {
              blogId: blogId,
              userId: userId,
            },
          })
        )
      );

      await Promise.all(
        categories.map((categoryId) =>
          prisma.blogCategoryOnBlog.create({
            data: {
              blogId: blogId,
              categoryId: categoryId,
            },
          })
        )
      );

      res.status(201).json({ message: "Blog created successfully!" });
    } catch (error) {
      console.error("Error creating blog:", error);
      res.status(500).json({ error: "Failed to create blog." });
    }
  }

  async getBlogById(req, res) {
    const { id } = req.params;
    try {
      const blog = await prisma.blog.findUnique({
        where: { blogId: id },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          authors: {
            include: {
              user: {
                select: {
                  fname: true,
                  lname: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      if (!blog) return res.status(404).json({ error: "Blog not found." });
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ error: "Failed to retrieve blog." });
    }
  }

  async updateBlog(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        body,
        categories,
        coverImageUrl,
        authors,
        published,
        coverImagePublicId,
      } = req.body;

      const existingBlog = await prisma.blog.findUnique({
        where: { blogId: id },
      });

      if (!existingBlog) {
        return res.status(404).json({ error: "Blog not found." });
      }

      if (
        existingBlog.coverImagePublicId &&
        coverImageUrl &&
        existingBlog.coverImagePublicId !== coverImagePublicId
      ) {
        await deleteFromCloudinary(existingBlog.coverImagePublicId);
      }

      const updateData = {
        title,
        body,
        published,
        coverImageUrl,
        coverImagePublicId,
      };

      const updatedBlog = await prisma.blog.update({
        where: { blogId: id },
        data: updateData,
      });

      await prisma.blogAuthor.deleteMany({
        where: { blogId: id },
      });

      await prisma.blogCategoryOnBlog.deleteMany({
        where: { blogId: id },
      });

      await Promise.all(
        authors.map((userId) =>
          prisma.blogAuthor.create({
            data: {
              blogId: id,
              userId: userId,
            },
          })
        )
      );

      await Promise.all(
        categories.map((categoryId) =>
          prisma.blogCategoryOnBlog.create({
            data: {
              blogId: id,
              categoryId: categoryId,
            },
          })
        )
      );

      res.json({ message: "Blog updated successfully!" });
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({ error: "Failed to update blog." });
    }
  }
  async deleteBlog(req, res) {
    const blogId = req.params.blogId;

    try {
      const blog = await prisma.blog.findUnique({
        where: { blogId },
      });

      if (!blog) {
        return res.status(404).json({ error: "Blog not found." });
      }

      await prisma.$transaction(async (prisma) => {
        await prisma.blogAuthor.deleteMany({
          where: { blogId },
        });

        await prisma.blogCategoryOnBlog.deleteMany({
          where: { blogId },
        });

        if (blog.coverImagePublicId) {
          await deleteFromCloudinary(blog.coverImagePublicId);
        }

        await prisma.blog.delete({
          where: { blogId },
        });
      });

      res.json({ message: "Blog deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ error: "Failed to delete blog" });
    }
  }
}

export default new BlogController();
