import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class BlogController {
  async createCategory(req, res) {
    const { categoryName } = req.body;
    try {
      const newCategory = await prisma.blogCategory.create({
        data: {
          name: categoryName,
        },
      });
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({
        error:
          "Ocorreu um erro desconhecido ao tentar criar a categoria, por favor, tente novamente",
        details: error.message,
      });
    }
  }

  async readCategories(req, res) {
    try {
      const allCategories = await prisma.blogCategory.findMany({
        orderBy: {
          categoryId: "asc",
        },
        select: {
          categoryId: true,
          name: true,
          _count: {
            select: {
              blogs: true,
            },
          },
        },
      });

      res.status(200).json(allCategories);
    } catch (error) {
      res.status(500).json({
        error:
          "Ocorreu um erro desconhecido ao tentar ver todas as categorias, por favor, tente novamente",
        details: error.message,
      });
    }
  }
  async updateCategory(req, res) {
    const { categoryId, categoryName } = req.body;
    if (!categoryId || !categoryName) {
      return res
        .status(400)
        .json({ message: "categoryId and categoryName are required." });
    }
    try {
      const updatedCategory = await prisma.blogCategory.update({
        where: { categoryId },
        data: {
          name: categoryName,
        },
      });

      res.status(200).json(updatedCategory);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: `Ocorreu um erro: ${err.message || "Unknown error"}`,
      });
    }
  }
  async deleteCategory(req, res) {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: "categoryId é necessário para excluir uma categoria.",
      });
    }

    try {
      const category = await prisma.blogCategory.findUnique({
        where: { categoryId: Number(categoryId) },
        select: {
          _count: {
            select: {
              blogs: true,
            },
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          message: "Categoria não encontrada.",
        });
      }

      if (category._count.blogs > 0) {
        return res.status(400).json({
          message:
            "Não é possível excluir esta categoria porque ela possui blogs associados.",
        });
      }

      await prisma.blogCategory.delete({
        where: { categoryId: Number(categoryId) },
      });

      res.status(200).json({ message: "Categoria excluída com sucesso." });
    } catch (error) {
      res.status(500).json({
        error:
          "Ocorreu um erro ao tentar excluir a categoria, por favor, tente novamente.",
        details: error.message,
      });
    }
  }
}
export default new BlogController();
