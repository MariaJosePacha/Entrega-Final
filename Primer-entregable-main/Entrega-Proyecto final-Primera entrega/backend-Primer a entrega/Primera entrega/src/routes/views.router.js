import { Router } from "express";
import ProductModel from "../models/product.model.js";
import CartModel from "../models/cart.model.js";

const router = Router();

// Ruta para ver todos los productos con paginación
router.get("/products", async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Por defecto: página 1 CON 10 productos por página

    try {
       
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true 
        };
        
        const result = await ProductModel.paginate({}, options); 

        res.render("home", {
            productos: result.docs,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            limit
        });
    } catch (error) {
        console.error("Error al obtener productos con paginación:", error);
        res.status(500).send("Error al obtener los productos");
    }
});

// Ruta para ver los detalles de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        // Encuentra el carrito por ID y se hace `populate` para obtener detalles
        const cart = await CartModel.findById(cartId).populate("products.product").lean();

        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", { cart });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).send("Error al obtener el carrito");
    }
});

// Vista en tiempo real con WebSockets
router.get("/realtimeproducts", async (req, res) => {
    res.render("realtimeproducts");
});

export default router;

