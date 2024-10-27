import { Router } from "express";
const router = Router();

// 1) Crear una vista "home.handlebars" la cual contenga una lista de todos los productos agregados hasta el momento

//buscamos importar al product manager y 
import ProductManager from "../managers/product-manager.js";
const manager = new ProductManager("./src/data/productos.json");
router.get("/products", async(req, res) =>{
    const productos = await manager.getProducts();

    // se recuperan los productos del Json y se los envia a la lista "home"
    res.render("home", {productos}); 
    // se renderiza la vista "home" y al mismo tiempo se envia un array con todos los productos del inventario 
    


})

router.get("/realtimeproducts", async(req, res)=>{
    res.render("realtimeproducts");
})
// Además, crear una vista “realTimeProducts.handlebars”, la cual estará en la ruta “/realtimeproducts” en nuestro views router, ésta contendrá la misma lista de productos, sin embargo, ésta trabajará sólo con websockets.

export default router; 

