import express from "express";
import Cart from "../models/cart.model.js";  
import Product from "../models/product.model.js";  
import mongoose from "mongoose";  
import { isValidObjectId } from 'mongoose';

const router = express.Router();

// 1) Crear un nuevo carrito vacío
router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = new Cart({ products: [] });
        await nuevoCarrito.save();
        res.status(201).json(nuevoCarrito);  // Respondemos con un estado 201 (creado)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al momento de crear el carrito" });
    }
});

// 2) Listar los productos del carrito por id y renderizar la vista `cart` (vista HTML)
router.get("/:cid", async (req, res) => {
    let cartId = req.params.cid;

    // Verificamos que el ID del carrito sea válido
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: "ID de carrito no válido" });
    }

    try {
        const carrito = await Cart.findById(cartId).populate("products.product");

        if (!carrito) {
            return res.status(404).json({ error: "Carrito no fue encontrado" });
        }

        // Solo renderizamos la vista HTML
        res.render("cart", { cart: carrito.toObject() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los productos del carrito" });
    }
});

// 2) Listar los productos del carrito por id y devolver JSON (para la API)
router.get("/api/:cid", async (req, res) => {
    let cartId = req.params.cid;

    // Verificamos que el ID del carrito sea válido
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: "ID de carrito no válido" });
    }

    try {
        const carrito = await Cart.findById(cartId).populate("products.product");

        if (!carrito) {
            return res.status(404).json({ error: "Carrito no fue encontrado" });
        }

        // Devolvemos los productos como JSON
        res.status(200).json(carrito);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los productos del carrito" });
    }
});

// 3) Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    // Verificar que el ID del carrito y el producto sean válidos
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ error: "ID de carrito o producto no válidos" });
    }

    try {
        const carrito = await Cart.findById(new mongoose.Types.ObjectId(cid));
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        carrito.products = carrito.products.filter(product => product.product.toString() !== pid);
        await carrito.save();

        res.status(200).json({ message: "Producto eliminado del carrito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el producto del carrito" });
    }
});

// 4) Actualizar el carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    // Verificar que el ID del carrito sea válido
    if (!mongoose.Types.ObjectId.isValid(cid)) {
        return res.status(400).json({ error: "ID de carrito no válido" });
    }

    try {
        const carrito = await Cart.findById(new mongoose.Types.ObjectId(cid));
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        carrito.products = products;
        await carrito.save();
        res.status(200).json({ message: "Carrito actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el carrito" });
    }
});

// 5) Actualizar solo la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Verificar que el ID del carrito y el producto sean válidos
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ error: "ID de carrito o producto no válidos" });
    }

    try {
        const carrito = await Cart.findById(new mongoose.Types.ObjectId(cid));
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const productIndex = carrito.products.findIndex(product => product.product.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: "Producto no encontrado en el carrito" });
        }

        carrito.products[productIndex].quantity = quantity;
        await carrito.save();
        res.status(200).json({ message: "Cantidad de producto actualizada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
    }
});

// 6) Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
    const { cid } = req.params;

    // Verificar que el ID del carrito sea válido
    if (!mongoose.Types.ObjectId.isValid(cid)) {
        return res.status(400).json({ error: "ID de carrito no válido" });
    }

    try {
        const carrito = await Cart.findById(new mongoose.Types.ObjectId(cid));
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        carrito.products = [];
        await carrito.save();
        res.status(200).json({ message: "Todos los productos fueron eliminados del carrito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar los productos del carrito" });
    }
});

// 7) Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    // Verificar que el ID del carrito y el producto sean válidos
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ error: "ID de carrito o producto no válidos" });
    }

    try {
        // Verificar que el carrito exista
        const carrito = await Cart.findById(new mongoose.Types.ObjectId(cid));
        if (!carrito) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        // Verificar que el producto exista
        const producto = await Product.findById(new mongoose.Types.ObjectId(pid));
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Comprobar si el producto ya está en el carrito
        const productIndex = carrito.products.findIndex(p => p.product.toString() === pid);
        if (productIndex !== -1) {
            // Si el producto ya existe en el carrito, actualizamos la cantidad
            carrito.products[productIndex].quantity += quantity;
        } else {
            // Si no existe, agregamos el producto al carrito
            carrito.products.push({ product: new mongoose.Types.ObjectId(pid), quantity });
        }

        await carrito.save();
        res.status(200).json(carrito.products);  // Respondemos con los productos del carrito actualizado
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al agregar el producto al carrito" });
    }
});

export default router;
