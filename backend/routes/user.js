import express from "express";
import initializeDatabase from "../controllers/user";
const router = express.Router();

const start = async () => {
  const controller = await initializeDatabase();
  router.get("/", async (req, res, next) => {
    try {
      const users = await controller.getUsers();
      res.status(200).json({
        message: true,
        users
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
      next(err);
    }
  });
  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await controller.getuser(id);

      res.status(200).json({
        message: true,
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
      next(error);
    }
  });
  router.post("/", async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const user = await controller.addUser({ name, email, password });
      res.status(200).json({
        message: true,
        user
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
      next(err);
    }
  });
  router.patch("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;
      const user = await controller.updateUser(id, { name, email, password });
      res.status(200).json({
        message: true,
        user
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
      next(err);
    }
  });
  router.delete("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const userDeleted = await controller.deleteUser(id);
      res.status(200).json({
        message: true,
        userDeleted
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
      next(err);
    }
  });
};

start();
module.exports = router;
